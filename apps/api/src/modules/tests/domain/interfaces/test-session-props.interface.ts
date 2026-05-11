import { TestSessionStatus, TestType } from "../entities/test-session.entity";

export interface TestSessionProps {
    companyId: string;
    candidateId?: string;
    collaboratorId?: string;
    token: string;
    status: TestSessionStatus;
    expiresAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    currentTest?: TestType;
    createdAt: Date;
}
