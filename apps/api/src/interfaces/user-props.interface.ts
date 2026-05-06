import { Email } from "@/shared/domain/value-objects/email.vo";
import { UserRole } from "@/entities/user.entity";
import { Password } from "@/shared/domain/value-objects/password.vo";

export interface UserProps {
    companyId: string;
    email: Email;
    password: Password;
    name: string;
    role: UserRole;
    avatarUrl?: string;
    lastLoginAt?: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
