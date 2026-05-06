import { Injectable, Inject } from '@nestjs/common';
import { Either, left, right } from '@shared/domain/errors/either';
import { EntityNotFoundError, ResourceAlreadyExistsError } from '@shared/domain/errors/domain-errors';
import { CreateCollaboratorInput } from '@/interfaces/create-collaborator-input.interface';
import { CreateCollaboratorOutput } from '@/interfaces/create-collaborator-output.interface';
import { OrgChartNode } from '@/interfaces/org-chart-node.interface';
import { Collaborator } from '@/entities/collaborator.entity';
import { ICollaboratorRepository } from '@/interfaces/icollaborator-repository.interface';
import { COLLABORATOR_REPOSITORY } from '@/repositories/collaborator.repository.interface';


@Injectable()
export class CreateCollaboratorUseCase {
  constructor(
    @Inject(COLLABORATOR_REPOSITORY) private readonly repo: ICollaboratorRepository,
  ) { }

  async execute(
    input: CreateCollaboratorInput,
  ): Promise<Either<ResourceAlreadyExistsError | EntityNotFoundError, CreateCollaboratorOutput>> {
    if (input.email) {
      const exists = await this.repo.existsByEmail(input.email, input.companyId);
      if (exists) return left(new ResourceAlreadyExistsError('Collaborator with this e-mail'));
    }

    if (input.parentId) {
      const parent = await this.repo.findById(input.parentId, input.companyId);
      if (!parent) return left(new EntityNotFoundError('Parent Collaborator', input.parentId));
    }

    const collaborator = Collaborator.create({
      companyId: input.companyId,
      name: input.name.trim(),
      email: input.email,
      role: input.role.trim(),
      department: input.department?.trim(),
      parentId: input.parentId,
    });

    await this.repo.save(collaborator);

    return right({ id: collaborator.id.value, name: collaborator.name, role: collaborator.role, parentId: collaborator.parentId });
  }
}

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
