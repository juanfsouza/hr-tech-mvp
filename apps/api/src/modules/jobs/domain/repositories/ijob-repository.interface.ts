import { PaginatedResult } from "@/interfaces/paginated-result.interface";
import { PaginationParams } from "@/interfaces/pagination-params.interface";
import { Job } from "../entities/job.entity";

export interface IJobRepository {
    findById(id: string, companyId: string): Promise<Job | null>;
    findByCompany(companyId: string, params: PaginationParams): Promise<PaginatedResult<Job>>;
    save(job: Job): Promise<void>;
    update(job: Job): Promise<void>;
    delete(id: string): Promise<void>;
}
