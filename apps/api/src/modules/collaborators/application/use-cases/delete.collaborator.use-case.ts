import { Injectable, Inject } from '@nestjs/common';
import { ICollaboratorRepository } from '@/modules/collaborators/domain/repositories/icollaborator-repository.interface';
import { EntityNotFoundError, BusinessRuleViolationError } from '@/shared/domain/errors/domain-errors';
import { Either, left, right } from '@/shared/domain/errors/either';
import { COLLABORATOR_REPOSITORY } from '../../domain/repositories/collaborator.repository.interface';

@Injectable()
export class DeleteCollaboratorUseCase {
  constructor(
    @Inject(COLLABORATOR_REPOSITORY) private readonly repo: ICollaboratorRepository,
  ) {}

  async execute(id: string, companyId: string): Promise<Either<EntityNotFoundError | BusinessRuleViolationError, { success: boolean }>> {
    const collaborator = await this.repo.findById(id, companyId);
    if (!collaborator) {
      return left(new EntityNotFoundError('Collaborator', id));
    }

    // Verificar se tem liderados (filhos)
    const children = await this.repo.findChildren(id, companyId);
    if (children.length > 0) {
      return left(new BusinessRuleViolationError('Cannot delete a collaborator who has direct reports. Reassign them first.'));
    }

    await this.repo.delete(id);

    return right({ success: true });
  }
}
