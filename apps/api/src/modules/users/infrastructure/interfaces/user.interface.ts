export interface PrismaUserRecord {
    id: string;
    companyId: string | null;
    email: string;
    passwordHash: string;
    name: string;
    role: string;
    avatarUrl: string | null;
    lastLoginAt: Date | null;
    isActive: boolean;
    isVerified: boolean;
    verificationToken: string | null;
    passwordResetToken: string | null;
    passwordResetExpires: Date | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}