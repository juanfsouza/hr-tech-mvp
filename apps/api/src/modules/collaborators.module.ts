import { Module } from '@nestjs/common';
import { COLLABORATOR_REPOSITORY } from './collaborators/domain/repositories/collaborator.repository.interface';
import { PrismaCollaboratorRepository } from './collaborators/infrastructure/repositories/prisma-collaborator.repository';
import { CollaboratorsController } from './collaborators/controllers/collaborators.controller';
import { CreateCollaboratorUseCase } from './collaborators/application/use-cases/create.collaborator.use-case';
import { GetOrgChartUseCase } from './collaborators/application/use-cases/list.collaborato.use-case';

@Module({
  controllers: [CollaboratorsController],
  providers: [
    { provide: COLLABORATOR_REPOSITORY, useClass: PrismaCollaboratorRepository },
    CreateCollaboratorUseCase,
    GetOrgChartUseCase,
  ],
  exports: [COLLABORATOR_REPOSITORY, GetOrgChartUseCase],
})
export class CollaboratorsModule { }
