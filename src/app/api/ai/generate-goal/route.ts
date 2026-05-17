import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { idea } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY_4 || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: "No API Key available" }, { status: 500 });
    }
    
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `You are an enterprise goal generation assistant. 
A user has this rough idea: "${idea}"
Generate a highly professional, SMART goal based on it.
Return strictly as JSON without any markdown formatting:
{ 
  "title": "string", 
  "description": "string", 
  "thrustArea": "string", 
  "uom": "string", 
  "targetValue": number, 
  "weightage": number 
}

Constraints:
Valid thrustAreas: 'Engineering Excellence', 'Customer Success', 'Growth', 'Infrastructure', 'Quality Assurance', 'Team Growth', 'Innovation', 'Process Optimization'.
Valid uoms: 'Percentage', 'Count', 'Hours', 'Revenue', 'People', 'Score', 'Components'.
Make targetValue realistic. Weightage should be around 10-30.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    let jsonStr = response.text || "{}";
    if (jsonStr.includes("```json")) jsonStr = jsonStr.split("```json")[1].split("```")[0].trim();
    else if (jsonStr.includes("```")) jsonStr = jsonStr.split("```")[1].split("```")[0].trim();

    return NextResponse.json(JSON.parse(jsonStr));
  } catch (err) {
    console.error("AI Goal Gen Error:", err);
    return NextResponse.json({ error: "Failed to generate goal via AI" }, { status: 500 });
  }
}
