import { AnalysisResult } from "../types";

export async function analyzeToS(
  input: { type: 'url' | 'file' | 'text'; value: string | { data: string; mimeType: string } }
): Promise<AnalysisResult> {

  const API = import.meta.env.VITE_API_URL;

  try {
    const response = await fetch(`${API}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    return response.json() as Promise<AnalysisResult>;
  } catch (err: any) {
    const errorMsg = err.toString();
    console.error('Analysis Error:', err);

    if (errorMsg.includes('QUOTA_LIMIT')) {
      throw new Error("QUOTA_LIMIT: You've reached your free tier speed limit. Please wait 60 seconds.");
    }
    if (errorMsg.includes('AUTH_ERROR')) {
      throw new Error("AUTH_ERROR: Your API key is invalid or not activated. Check .env.");
    }
    throw new Error(errorMsg);
  }
}
