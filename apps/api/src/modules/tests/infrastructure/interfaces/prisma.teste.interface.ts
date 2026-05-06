export interface PrismaSessionRecord {
    id: string; companyId: string; candidateId: string | null;
    token: string; status: string; expiresAt: Date;
    startedAt: Date | null; completedAt: Date | null;
    currentTest: string | null; createdAt: Date;
}