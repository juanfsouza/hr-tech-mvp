import { Module } from '@nestjs/common';
import { CANDIDATE_REPOSITORY } from './candidates/domain/repositories/candidate.repository.interface';
import { PrismaCandidateRepository } from './candidates/infrastructure/repositories/prisma-candidate.repository';
import { CandidatesController } from './candidates/presentation/candidates.controller';
import {
  CreateCandidateUseCase,
  ListCandidatesByJobUseCase,
  GetCandidateByIdUseCase,
  UpdateCandidateStatusUseCase,
  AnonymizeCandidateUseCase,
} from './candidates/application/use-cases/candidates.use-cases';

@Module({
  controllers: [CandidatesController],
  providers: [
    { provide: CANDIDATE_REPOSITORY, useClass: PrismaCandidateRepository },
    CreateCandidateUseCase,
    ListCandidatesByJobUseCase,
    GetCandidateByIdUseCase,
    UpdateCandidateStatusUseCase,
    AnonymizeCandidateUseCase,
  ],
  exports: [CANDIDATE_REPOSITORY],
})
export class CandidatesModule {}
