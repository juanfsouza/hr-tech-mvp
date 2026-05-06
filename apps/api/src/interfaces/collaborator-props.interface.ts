export interface CollaboratorProps {
    companyId: string;
    name: string;
    email?: string;
    role: string;
    department?: string;
    parentId?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
