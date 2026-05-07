import { CandidateStatus } from "../entities/candidate.entity";

export interface CandidateProps {
    companyId: string;
    jobId?: string;
    name: string;
    email: string;
    phone?: string;
    resumeUrl?: string;
    status: CandidateStatus;
    lgpdConsent: boolean;
    consentAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
