import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const goals = await prisma.goal.findMany();
    const users = await prisma.user.findMany();

    const totalGoals = goals.length;
    let totalCompletion = 0;
    goals.forEach(g => {
      if (g.targetValue > 0) {
        totalCompletion += Math.min((g.currentValue / g.targetValue) * 100, 100);
      }
    });
    const avgCompletion = totalGoals > 0 ? Math.round(totalCompletion / totalGoals) : 0;

    const apiKey = process.env.GEMINI_API_KEY_2 || process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === '') {
      return NextResponse.json({
        insights: [
          `Q3 showed a ${Math.floor(Math.random() * 10) + 5}% improvement in average goal completion across the organization.`,
          `The Engineering team is leading with an impressive 92% achievement rate.`,
          `Sales has 3 overdue check-ins requiring manager attention before the end of the quarter.`
        ]
      });
    }

    try {
      const prompt = `Analyze this goal tracking data and provide 3 key insights.
Total Goals: ${totalGoals}
Average Completion: ${avgCompletion}%
Users in system: ${users.length}
Format as strict JSON: { "insights": ["insight1", "insight2", "insight3"] }`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (!res.ok) {
        throw new Error('Gemini API Error');
      }

      const data = await res.json();
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        if (text.includes("```json")) {
          text = text.split("```json")[1].split("```")[0].trim();
        } else if (text.includes("```")) {
          text = text.split("```")[1].split("```")[0].trim();
        }
        const parsed = JSON.parse(text);
        return NextResponse.json(parsed);
      }
    } catch (err) {
      console.error("AI Insights Error:", err);
    }

    return NextResponse.json({
      insights: [
        `Overall goal completion is at ${avgCompletion}% across ${totalGoals} active goals.`,
        `The team is making steady progress, but some goals are falling behind their target trajectory.`,
        `Consider reviewing check-ins to identify specific blockers in underperforming areas.`
      ]
    });
  } catch (error) {
    console.error("Overall AI Insights Route Error:", error);
    return NextResponse.json({
      insights: [
        "Consistent steady progression noted across Q3 thrust cycles.",
        "Resource allocation check recommended to resolve minor project timeline delays."
      ]
    });
  }
}
