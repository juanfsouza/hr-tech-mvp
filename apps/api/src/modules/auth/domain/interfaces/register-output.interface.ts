import { UserRole } from "@/modules/users/domain/entities/user.entity";

export interface RegisterOutput {
    userId: string;
    name: string;
    email: string;
    role: UserRole;
}
