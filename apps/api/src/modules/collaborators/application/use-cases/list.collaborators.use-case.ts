import { Injectable, Inject } from '@nestjs/common';
import { ICollaboratorRepository } from '@/modules/collaborators/domain/repositories/icollaborator-repository.interface';
import { COLLABORATOR_REPOSITORY } from '../../domain/repositories/collaborator.repository.interface';

export interface ListCollaboratorsOutput {
  id: string;
  name: string;
  role: string;
  department?: string;
}

@Injectable()
export class ListCollaboratorsUseCase {
  constructor(
    @Inject(COLLABORATOR_REPOSITORY) private readonly repo: ICollaboratorRepository,
  ) {}

  async execute(companyId: string): Promise<ListCollaboratorsOutput[]> {
    const collaborators = await this.repo.findByCompany(companyId);
    
    return collaborators.map(c => ({
      id: c.id.value,
      name: c.name,
      role: c.role,
      department: c.department,
    }));
  }
}
