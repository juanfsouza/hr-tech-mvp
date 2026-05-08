import { Email } from "@/shared/domain/value-objects/email.vo";
import { User } from "../entities/user.entity";

export interface IUserRepository {
    findByVerificationToken(token: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: Email): Promise<User | null>;
    findByCompany(companyId: string, cursor?: string, take?: number): Promise<User[]>;
    save(user: User): Promise<void>;
    update(user: User): Promise<void>;
    delete(id: string): Promise<void>;
    existsByEmail(email: Email): Promise<boolean>;
    countByCompany(companyId: string): Promise<number>;
}
