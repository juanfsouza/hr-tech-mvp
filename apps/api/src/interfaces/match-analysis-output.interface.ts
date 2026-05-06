export interface MatchAnalysisOutput {
    overallScore: number;
    jobMatch: { score: number; rationale: string; strengths: string[]; risks: string[] };
    leaderMatch: { score: number; rationale: string; communicationTip: string };
    cultureMatch: { score: number; rationale: string };
    recommendation: 'STRONG_YES' | 'YES' | 'MAYBE' | 'NO';
    developmentPlan: string[];
    summary: string;
}
