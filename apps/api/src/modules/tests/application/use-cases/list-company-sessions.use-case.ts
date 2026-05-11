import { ITestRepository } from "@/modules/tests/domain/repositories/itest-repository.interface";
import { Injectable, Inject } from "@nestjs/common";
import { TEST_REPOSITORY } from "../../domain/repositories/test.repository.interface";

@Injectable()
export class ListCompanySessionsUseCase {
    constructor(@Inject(TEST_REPOSITORY) private readonly repo: ITestRepository) { }

    async execute(companyId: string) {
        // Precisamos implementar findSessionsByCompany no repositório
        // Mas para o MVP, podemos retornar algo simples ou buscar via Prisma direto se necessário
        // Vou assumir que vamos adicionar findSessionsByCompany no repositório
        const sessions = await (this.repo as any).findSessionsByCompany(companyId);
        return sessions.map((s: any) => ({
            id: s.id.value,
            collaboratorId: s.collaboratorId,
            candidateId: s.candidateId,
            status: s.status,
            completedAt: s.completedAt,
            token: s.token
        }));
    }
}
