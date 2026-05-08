import { IUserRepository } from "@/modules/users/domain/repositories/iuser-repository.interface";


export class HealthService {
    constructor(private readonly repo: IUserRepository) { }

    async health(): Promise<{ status: string, test: string }> {
        return { status: 'ok', test: "ok" };
    }

    async healthDb(): Promise<{ status: string, test: string }> {
        const user = await this.repo.findById("");
        return { status: 'ok', test: user?.name || "fail" };
    }

    async healthAll(): Promise<{ status: string, test: string }> {
        return { status: 'ok', test: "ok" };
    }
}