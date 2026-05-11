import { UserRole } from "@/modules/users/domain/entities/user.entity";

export interface RegisterInput {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
}
