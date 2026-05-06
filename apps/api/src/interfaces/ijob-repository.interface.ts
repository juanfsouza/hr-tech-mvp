export interface IJobRepository {
    findById(id: string, companyId: string): Promise<Job | null>;
    findByCompany(companyId: string, params: PaginationParams): Promise<PaginatedResult<Job>>;
    save(job: Job): Promise<void>;
    update(job: Job): Promise<void>;
    delete(id: string): Promise<void>;
}
