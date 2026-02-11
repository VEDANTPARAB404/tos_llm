import express from 'express';
import cors from 'cors';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const MODEL_NAME = 'gemini-3-flash-preview';

app.post('/api/analyze', async (req, res) => {
  try {
    const { input } = req.body;
    const apiKey = process.env.API_KEY;

    if (!apiKey || apiKey.includes('your_actual_key_here') || apiKey.trim() === "") {
      return res.status(400).json({ error: "Missing API Key in .env file" });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are a cynical, highly protective consumer rights attorney. 
    Your job is to analyze Terms of Service and Privacy Policies to warn users about potential 'traps'.
    
    CRITICAL RULES:
    1. Be opinionated and blunt. 
    2. Look for: Forced arbitration, data selling, permanent content licenses, and waiver of class-action rights.
    3. Always return results in structured JSON.`;

    let contents;
    let tools = undefined;

    if (input.type === 'file') {
      contents = {
        parts: [
          { inlineData: input.value },
          { text: "Analyze the top 5 most dangerous clauses in this document. Return JSON." }
        ]
      };
    } else if (input.type === 'url') {
      contents = `Search for the Terms of Service and Privacy Policy for this URL: ${input.value}. Analyze the top 5 risks based on the latest version available. Return JSON.`;
      tools = [{ googleSearch: {} }];
    } else {
      contents = `Analyze this legal text for top 5 risks: \n\n ${input.value}`;
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents,
      config: {
        systemInstruction,
        tools,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            companyName: { type: Type.STRING },
            summary: { type: Type.STRING },
            riskScore: { type: Type.NUMBER },
            verdict: { 
              type: Type.STRING,
              enum: ['Safe', 'Caution', 'Risky', 'Extreme Risk']
            },
            criticalPoints: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] }
                },
                required: ['title', 'description', 'severity']
              }
            },
            expertOpinion: { type: Type.STRING }
          },
          required: ['companyName', 'summary', 'riskScore', 'verdict', 'criticalPoints', 'expertOpinion']
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      return res.status(400).json({ error: "Empty response from AI" });
    }

    res.json(JSON.parse(resultText));
  } catch (error) {
    console.error('API Error:', error);
    const errorMsg = error.toString();
    
    if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
      return res.status(429).json({ error: "QUOTA_LIMIT: Free tier speed limit reached. Wait 60 seconds." });
    }
    if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('403')) {
      return res.status(403).json({ error: "AUTH_ERROR: Invalid API key" });
    }
    
    res.status(500).json({ error: errorMsg });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
