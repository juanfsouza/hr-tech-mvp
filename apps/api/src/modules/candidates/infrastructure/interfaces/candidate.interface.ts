export interface PrismaCandidateRecord {
    id: string; companyId: string; jobId: string | null;
    name: string; email: string; phone: string | null;
    resumeUrl: string | null; status: string; lgpdConsent: boolean;
    consentAt: Date | null; createdAt: Date; updatedAt: Date; deletedAt: Date | null;
}
