import { Injectable, Inject } from '@nestjs/common';
import { ICollaboratorRepository } from '@/modules/collaborators/domain/repositories/icollaborator-repository.interface';
import { EntityNotFoundError } from '@/shared/domain/errors/domain-errors';
import { Either, left, right } from '@/shared/domain/errors/either';
import { COLLABORATOR_REPOSITORY } from '../../domain/repositories/collaborator.repository.interface';

export interface UpdateCollaboratorInput {
  id: string;
  companyId: string;
  name?: string;
  role?: string;
  department?: string;
  parentId?: string | null;
  email?: string;
}

@Injectable()
export class UpdateCollaboratorUseCase {
  constructor(
    @Inject(COLLABORATOR_REPOSITORY) private readonly repo: ICollaboratorRepository,
  ) {}

  async execute(input: UpdateCollaboratorInput): Promise<Either<EntityNotFoundError, { success: boolean }>> {
    const collaborator = await this.repo.findById(input.id, input.companyId);
    if (!collaborator) {
      return left(new EntityNotFoundError('Collaborator', input.id));
    }

    if (input.parentId) {
      const parent = await this.repo.findById(input.parentId, input.companyId);
      if (!parent) {
        return left(new EntityNotFoundError('Parent Collaborator', input.parentId));
      }
    }

    collaborator.update({
      name: input.name,
      role: input.role,
      department: input.department,
      parentId: input.parentId === null ? undefined : input.parentId,
      email: input.email,
    });

    await this.repo.update(collaborator);

    return right({ success: true });
  }
}
