export interface CreateCollaboratorInput {
    companyId: string;
    name: string;
    email?: string;
    role: string;
    department?: string;
    parentId?: string;
}
