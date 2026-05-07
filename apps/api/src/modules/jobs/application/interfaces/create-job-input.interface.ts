export interface CreateJobInput {
    companyId: string;
    title: string;
    description?: string;
    requirements?: string[];
    salaryMin?: number;
    salaryMax?: number;
    location?: string;
    isRemote?: boolean;
    responsibleId?: string;
}
