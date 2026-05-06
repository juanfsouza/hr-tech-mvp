import { Module } from '@nestjs/common';
import { COLLABORATOR_REPOSITORY } from './collaborators/domain/repositories/collaborator.repository.interface';
import { PrismaCollaboratorRepository } from './collaborators/infrastructure/repositories/prisma-collaborator.repository';
import { CreateCollaboratorUseCase, GetOrgChartUseCase } from './collaborators/application/use-cases/collaborator.use-cases';
import { CollaboratorsController } from './collaborators/presentation/collaborators.controller';

@Module({
  controllers: [CollaboratorsController],
  providers: [
    { provide: COLLABORATOR_REPOSITORY, useClass: PrismaCollaboratorRepository },
    CreateCollaboratorUseCase,
    GetOrgChartUseCase,
  ],
  exports: [COLLABORATOR_REPOSITORY, GetOrgChartUseCase],
})
export class CollaboratorsModule {}
