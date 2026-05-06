export interface MatchResult {
    matchId: string;
    overallScore: number;
    recommendation: string;
    summary: string;
    details: {
        jobMatch: object;
        leaderMatch: object;
        cultureMatch: object;
        developmentPlan: string[];
        };
}
