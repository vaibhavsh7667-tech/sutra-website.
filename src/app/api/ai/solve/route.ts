import { NextRequest, NextResponse } from 'next/server';
import { solveProblemDeterministically, explainQuestion, generateGraphExplanation } from '@/lib/solver-engine';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, mode, difficulty, userApiKey } = body;

    if (!query || typeof query !== 'string' || query.trim() === '') {
      return NextResponse.json({ error: 'Query is required.' }, { status: 400 });
    }

    const apiKey = userApiKey || process.env.GEMINI_API_KEY;

    // Handle "Explain Question" mode
    if (mode === 'explain') {
      if (apiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are SUTRA AI, an expert mathematics, physics, and chemistry teacher.
Explain this question in very simple language for a student.
Target Difficulty Level: ${difficulty || 'Medium'}.
Question: "${query}"

Return a valid JSON object matching this schema:
{
  "difficulty": "${difficulty || 'Medium'}",
  "whatIsAsking": "plain explanation of what problem asks",
  "givenInfo": ["list of given facts and numbers"],
  "missingInfo": ["what is unknown or needs to be found"],
  "conceptsAndFormulas": ["relevant mathematical or scientific formulas"],
  "firstStep": "the very first concrete action the student should take",
  "symbolsMeanings": [{"symbol": "x", "meaning": "what it represents"}],
  "summaryNote": "encouraging tip or common pitfall to avoid"
}
ONLY return the JSON object, without backticks or markdown fences.`,
          });

          const rawText = response.text || '';
          const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          return NextResponse.json({ success: true, data: parsed, source: 'ai' });
        } catch {
          // Fall back gracefully to deterministic explanation
          const fallback = explainQuestion(query, difficulty);
          return NextResponse.json({ success: true, data: fallback, source: 'local' });
        }
      }

      const fallback = explainQuestion(query, difficulty);
      return NextResponse.json({ success: true, data: fallback, source: 'local' });
    }

    // Handle "Graph Explanation" mode
    if (mode === 'graph_explanation') {
      const graphAnalysis = generateGraphExplanation(query);
      return NextResponse.json({ success: true, data: graphAnalysis, source: 'local' });
    }

    // Default mode: "AI Solve"
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `You are SUTRA AI, the premier AI-powered scientific calculator and STEM solver.
Solve the following math or science problem:
Problem: "${query}"

Requirements:
- Teach the user how the problem was solved. Do not only provide the final answer.
- Clearly provide Given information, Formula required, Step-by-step solution, Substitution, Calculation, Final Answer, and why the answer is correct.
- If it's a science problem, include units in standard SI notation.
- If applicable, specify a 2D Cartesian equation for graphing (e.g. "x^2 - 4" or "sin(x)").
- Output in strictly valid JSON format matching this schema:
{
  "id": "${Math.random().toString(36).substring(2, 9)}",
  "query": "${query.replace(/"/g, '\\"')}",
  "given": [{"label": "Variable or Constant", "value": "Value", "unit": "Unit if any"}],
  "formulaRequired": ["Formula 1 in LaTeX e.g. x = \\\\frac{-b \\\\pm \\\\sqrt{\\\\Delta}}{2a}"],
  "steps": [
    {
      "stepNumber": 1,
      "title": "Step Title",
      "description": "Clear step description",
      "mathExpression": "LaTeX expression",
      "explanation": "Why this step was done"
    }
  ],
  "substitution": "Values substituted into formula",
  "calculation": "Exact calculation line",
  "finalAnswer": "Final answer in LaTeX notation",
  "unit": "Unit if applicable",
  "whyCorrect": "Short mathematical or physical explanation of why this answer is correct",
  "importantNote": "Key takeaway, edge cases, or domain constraints",
  "graphEquation": "x^2 - 4 (if a graphable curve is relevant, else null)",
  "verification": {
    "verified": true,
    "reason": "Direct back-substitution or theorem check",
    "details": "Explanation of verification"
  }
}
ONLY return the JSON object, without backticks or markdown fences.`,
        });

        const rawText = response.text || '';
        const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return NextResponse.json({ success: true, data: parsed, source: 'ai' });
      } catch (err: unknown) {
        console.warn('Gemini API call failed, falling back to deterministic engine:', (err as Error)?.message);
        const fallback = solveProblemDeterministically(query);
        return NextResponse.json({ success: true, data: fallback, source: 'local' });
      }
    }

    // Local deterministic solver
    const localSolution = solveProblemDeterministically(query);
    return NextResponse.json({ success: true, data: localSolution, source: 'local' });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error)?.message || 'Failed to process mathematical request.' },
      { status: 500 }
    );
  }
}
