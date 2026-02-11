
export interface AnalysisResult {
  summary: string;
  criticalPoints: CriticalPoint[];
  riskScore: number; // 0 to 100
  verdict: 'Safe' | 'Caution' | 'Risky' | 'Extreme Risk';
  expertOpinion: string;
  companyName: string;
}

export interface CriticalPoint {
  title: string;
  description: string;
  severity: 'High' | 'Medium' | 'Low';
}

export type InputMode = 'url' | 'file' | 'text';

export interface AnalysisState {
  loading: boolean;
  error: string | null;
  result: AnalysisResult | null;
  progressMessage: string;
}
