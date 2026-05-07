import { UserRole } from "@/entities/user.entity";

export interface RegisterInput {
    companyId: string;
    name: string;
    email: string;
    password: string;
    role?: UserRole;
}
