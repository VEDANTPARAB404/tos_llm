import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { input } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(400).json({ error: 'Missing OPENROUTER_API_KEY' });
    }

    let userContent = '';

    if (input.type === 'file') {
      userContent = `Analyze the top 5 most dangerous clauses in this document:

${input.value}`;
    } else if (input.type === 'url') {
      userContent = `Analyze the Terms of Service and Privacy Policy for this website:
${input.value}

Identify top 5 risks.`;
    } else {
      userContent = `Analyze this legal text and identify:

1. Top 5 risky clauses
2. Overall risk score (0-100)
3. Clear summary
4. Expert legal opinion

Text:
${input.value}`;
    }

    const systemInstruction = `
You are a cynical, highly protective consumer rights attorney.

CRITICAL RULES:
- Be blunt and opinionated.
- Look for arbitration clauses, liability waivers, forced data sharing, auto-renew traps.
- ALWAYS respond in STRICT VALID JSON only.
- Do NOT include markdown.
- Do NOT include explanation outside JSON.

Return JSON in this exact structure:

{
  "companyName": "string",
  "summary": "string",
  "riskScore": number,
  "verdict": "Safe | Caution | Risky | Extreme Risk",
  "criticalPoints": [
    {
      "title": "string",
      "description": "string",
      "severity": "High | Medium | Low"
    }
  ],
  "expertOpinion": "string"
}
`;

    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3-70b-instruct',
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userContent }
          ],
          temperature: 0.2
        })
      }
    );

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ error: 'Invalid AI response' });
    }

    let resultText = data.choices[0].message.content.trim();

    resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const parsed = JSON.parse(resultText);
      return res.status(200).json(parsed);
    } catch (err) {
      console.error('JSON Parse Error:', resultText);
      return res.status(500).json({
        error: 'Model did not return valid JSON',
        raw: resultText
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: String(error) });
  }
}
