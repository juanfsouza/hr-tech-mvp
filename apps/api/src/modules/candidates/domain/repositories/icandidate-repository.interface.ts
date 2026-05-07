import { PaginationParams } from "@/shared/domain/interfaces/pagination-params.interface";
import { PaginatedResult } from "@/shared/domain/interfaces/paginated-result.interface";
import { Candidate } from "../entities/candidate.entity";


export interface ICandidateRepository {
    findById(id: string, companyId: string): Promise<Candidate | null>;
    findByJob(jobId: string, companyId: string, params: PaginationParams): Promise<PaginatedResult<Candidate>>;
    findByEmail(email: string, companyId: string): Promise<Candidate | null>;
    save(candidate: Candidate): Promise<void>;
    update(candidate: Candidate): Promise<void>;
    delete(id: string): Promise<void>;
}
