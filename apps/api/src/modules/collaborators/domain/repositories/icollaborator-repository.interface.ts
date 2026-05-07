import { Collaborator } from "../entities/collaborator.entity";


export interface ICollaboratorRepository {
    findById(id: string, companyId: string): Promise<Collaborator | null>;
    findByCompany(companyId: string): Promise<Collaborator[]>;
    findChildren(parentId: string, companyId: string): Promise<Collaborator[]>;
    save(collaborator: Collaborator): Promise<void>;
    update(collaborator: Collaborator): Promise<void>;
    delete(id: string): Promise<void>;
    existsByEmail(email: string, companyId: string): Promise<boolean>;
}
