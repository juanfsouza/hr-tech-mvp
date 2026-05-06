export interface PrismaCollaboratorRecord {
    id: string;
    companyId: string;
    name: string;
    email: string | null;
    role: string;
    department: string | null;
    parentId: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
