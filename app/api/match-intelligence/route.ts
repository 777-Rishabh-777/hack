import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { homeTeam, awayTeam, stats, history } = await request.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured on server. Please add OPENAI_API_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    const prompt = `
      You are SportSphere AI, an elite football analytics assistant.
      Provide a match intelligence analysis for: ${homeTeam} vs ${awayTeam}.

      Match Statistics Provided:
      ${JSON.stringify(stats, null, 2)}

      Historical Performance:
      ${JSON.stringify(history, null, 2)}

      Generate the following structured JSON output:
      {
        "preview": "A professional 3-sentence summary analyzing the significance and current atmosphere of this fixture.",
        "keyPlayers": [
          {
            "name": "Key Player from ${homeTeam}",
            "team": "${homeTeam}",
            "role": "Position & tactical role",
            "stat": "Key metric (e.g., 7 Goals, 4 Assists)",
            "impact": "Brief description of how they influence the team's build-up or defense."
          },
          {
            "name": "Key Player from ${awayTeam}",
            "team": "${awayTeam}",
            "role": "Position & tactical role",
            "stat": "Key metric",
            "impact": "Brief description of their tactical importance."
          }
        ],
        "insights": [
          {
            "title": "Tactical Insight 1 (e.g., Pressing Intensity)",
            "description": "Details about how the teams' structures clash, pressing zones, and transitional vulnerabilities."
          },
          {
            "title": "Tactical Insight 2 (e.g., Transitional Vulnerability)",
            "description": "Details on transition patterns and set-piece advantages."
          }
        ],
        "prediction": {
          "homeWinProb": 45,
          "awayWinProb": 35,
          "drawProb": 20,
          "scoreline": "2-1",
          "rationale": "One sentence summary explaining the predicted outcome."
        }
      }

      Respond ONLY with valid JSON. Do not include markdown code block formatting or any extra text.
    `;

    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      }),
    });

    if (!openAiResponse.ok) {
      const errData = await openAiResponse.json();
      throw new Error(errData.error?.message || `OpenAI API returned status ${openAiResponse.status}`);
    }

    const data = await openAiResponse.json();
    const resultText = data.choices?.[0]?.message?.content || '{}';
    return NextResponse.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error('Error generating AI match intelligence:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
