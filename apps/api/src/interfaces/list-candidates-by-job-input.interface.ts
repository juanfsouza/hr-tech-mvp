export interface ListCandidatesByJobInput {
    companyId: string;
    jobId: string;
    cursor?: string;
    take?: number;
}
