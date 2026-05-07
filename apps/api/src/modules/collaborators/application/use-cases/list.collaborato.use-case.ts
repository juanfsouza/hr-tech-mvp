import { ICollaboratorRepository } from "@/modules/collaborators/domain/repositories/icollaborator-repository.interface";
import { OrgChartNode } from "@/modules/collaborators/application/interfaces/org-chart-node.interface";
import { Injectable, Inject } from "@nestjs/common";
import { COLLABORATOR_REPOSITORY } from "../../domain/repositories/collaborator.repository.interface";

@Injectable()
export class GetOrgChartUseCase {
    constructor(
        @Inject(COLLABORATOR_REPOSITORY) private readonly repo: ICollaboratorRepository,
    ) { }

    async execute(companyId: string): Promise<OrgChartNode[]> {
        const all = await this.repo.findByCompany(companyId);

        const map = new Map<string, OrgChartNode>();
        const roots: OrgChartNode[] = [];

        for (const c of all) {
            map.set(c.id.value, {
                id: c.id.value,
                name: c.name,
                role: c.role,
                department: c.department,
                email: c.email,
                children: [],
            });
        }

        for (const c of all) {
            const node = map.get(c.id.value)!;
            if (c.parentId) {
                const parent = map.get(c.parentId);
                if (parent) parent.children.push(node);
            } else {
                roots.push(node);
            }
        }

        return roots;
    }
}
