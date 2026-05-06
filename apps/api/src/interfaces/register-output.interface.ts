import { UserRole } from "@/entities/user.entity";

export interface RegisterOutput {
    userId: string;
    name: string;
    email: string;
    role: UserRole;
}
