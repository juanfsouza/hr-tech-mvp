import { JobStatus } from "@/entities/job.entity";

export interface JobProps {
    companyId: string;
    title: string;
    description?: string;
    requirements: string[];
    salaryMin?: number;
    salaryMax?: number;
    location?: string;
    isRemote: boolean;
    status: JobStatus;
    responsibleId?: string;
    aiGeneratedJd?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
