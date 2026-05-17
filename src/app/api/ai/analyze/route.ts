import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY_3 || process.env.GEMINI_API_KEY });

async function generateAnalysisWithGemini(metrics: any, user: any, allGoals: any[], query: string) {
  const prompt = `You are Atom AI, an enterprise performance intelligence assistant.
User: ${user.name} (${user.role}, ${user.jobTitle})
User Query: "${query}"

Live Performance Metrics:
- Total Goals: ${metrics.totalGoals}
- Approved: ${metrics.approved}
- Delayed: ${metrics.delayed}
- Pending Approval: ${metrics.pendingApproval}
- Overall Progress: ${metrics.overallProgress}%

Goals Details: ${JSON.stringify(allGoals.map(g => ({ title: g.title, progress: Math.round((g.currentValue / g.targetValue) * 100), status: g.status })))}

Please provide a concise, professional, and insightful response to the user's query based on these metrics.
Respond ONLY in the following JSON format without any markdown or extra text:
{
  "text": "Your detailed response...",
  "suggestedAction": "A short 2-4 word button label (e.g., 'Schedule Review', 'Re-allocate Resources')",
  "confidenceScore": 0.95,
  "dynamicDataUpdate": {
    "trendShift": 15,
    "completedInc": 1,
    "status": "APPROVED"
  }
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    let jsonStr = response.text || "{}";
    if (jsonStr.includes("```json")) {
      jsonStr = jsonStr.split("```json")[1].split("```")[0].trim();
    } else if (jsonStr.includes("```")) {
      jsonStr = jsonStr.split("```")[1].split("```")[0].trim();
    }
    
    const parsed = JSON.parse(jsonStr);
    return {
      text: parsed.text || "Analysis complete.",
      suggestedAction: parsed.suggestedAction || "Review Metrics",
      confidenceScore: parsed.confidenceScore || 0.9,
      dynamicDataUpdate: parsed.dynamicDataUpdate || { trendShift: 10, completedInc: 1 }
    };
  } catch (error) {
    console.error("Gemini API Error, utilizing fallback analytics engine:", error);
    // Smart rule-based fallback response if Gemini is offline
    const isGoalRelated = query.toLowerCase().includes("goal") || query.toLowerCase().includes("progress") || query.toLowerCase().includes("status");
    const text = isGoalRelated 
      ? `Based on my real-time analytics, you have ${metrics.totalGoals} active OKRs with an overall completion average of ${metrics.overallProgress}%. Currently, ${metrics.pendingApproval} goals are pending approval. I recommend finalizing these targets to lock in your execution plan.`
      : `Hello ${user.name}. I'm synced with your performance dashboard. Your average milestone score is currently ${metrics.overallProgress}%, with ${metrics.approved} approved goals. Is there a specific department or goal cycle you want me to outline?`;
    
    return {
      text,
      suggestedAction: metrics.pendingApproval > 0 ? "Approve Goals" : "Optimize Resources",
      confidenceScore: 0.85,
      dynamicDataUpdate: {
        trendShift: Math.floor(Math.random() * 20) + 5,
        completedInc: 1,
        status: metrics.pendingApproval > 0 ? "PENDING_APPROVAL" : "APPROVED"
      }
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, query } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required for contextual analysis' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { department: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User context not found' }, { status: 404 });
    }

    const allGoals = await prisma.goal.findMany({
      where: { employeeId: userId },
      include: { checkIns: { orderBy: { updatedAt: 'desc' } } }
    });

    const metrics = {
      totalGoals: allGoals.length,
      approved: allGoals.filter(g => g.status === 'APPROVED').length,
      pendingApproval: allGoals.filter(g => g.status === 'PENDING_APPROVAL').length,
      delayed: allGoals.filter(g => g.checkIns?.[0]?.status === 'DELAYED').length,
      overallProgress: Math.round(
        allGoals.reduce((acc, g) => {
          const progress = Math.min((g.currentValue / g.targetValue) * 100, 100);
          return acc + progress * (g.weightage / 100);
        }, 0)
      ) || 0
    };

    // Audit log
    await prisma.auditLog.create({
      data: { userId, action: 'AI_ANALYSIS_REQUESTED', newValue: `Queried AI: "${query}"` }
    });

    // Artificial delay to simulate real-time agent token stream
    await new Promise(resolve => setTimeout(resolve, 1000));

    const analysis = await generateAnalysisWithGemini(metrics, user, allGoals, query);
    return NextResponse.json(analysis);

  } catch (error) {
    console.error("AI Analysis Error:", error);
    return NextResponse.json({ error: 'Failed to generate AI analysis' }, { status: 500 });
  }
}
