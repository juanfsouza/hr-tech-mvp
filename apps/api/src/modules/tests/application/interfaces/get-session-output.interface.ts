export interface GetSessionOutput {
    sessionId: string;
    companyId: string;
    status: string;
    currentTest: string | undefined;
    expiresAt: Date;
    candidateId?: string;
    responses?: Record<string, string>;
}
