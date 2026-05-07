export interface GenerateJdInput {
    jobTitle: string;
    companyContext: string;
    requirements: string[];
    isRemote: boolean;
    salaryRange?: { min: number; max: number };
}
