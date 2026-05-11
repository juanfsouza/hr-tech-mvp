export interface CreateTestSessionInput {
    companyId: string;
    candidateId?: string;
    collaboratorId?: string;
    expiryHours?: number;
}
