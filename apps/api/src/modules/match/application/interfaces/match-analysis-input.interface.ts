export interface MatchAnalysisInput {
    candidate: {
        name: string;
        disc: { D: number; I: number; S: number; C: number; dominant: string };
        enneagram: { type: number; wing: string; typeName: string };
        mbti: { type: string; bigFive: Record<string, number> };
        };
    job: {
        title: string;
        description: string;
        requirements: string[];
        };
    leader?: {
        name: string;
        disc?: { D: number; I: number; S: number; C: number; dominant: string };
        enneagram?: { type: number; wing: string };
        };
    companyContext: string;
}
