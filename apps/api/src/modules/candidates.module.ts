import { Module } from '@nestjs/common';
import { CANDIDATE_REPOSITORY } from './candidates/domain/repositories/candidate.repository.interface';
import { PrismaCandidateRepository } from './candidates/infrastructure/repositories/prisma-candidate.repository';
import { CandidatesController } from './candidates/controllers/candidates.controller';
import { AnonymizeCandidateUseCase } from './candidates/application/use-cases/anonymize-candidate.use-case';
import { CreateCandidateUseCase } from './candidates/application/use-cases/create-candidates.use-case';
import { ListCandidatesByJobUseCase, GetCandidateByIdUseCase, ListCandidatesByCompanyUseCase } from './candidates/application/use-cases/list-candidates.use-case';
import { UpdateCandidateStatusUseCase } from './candidates/application/use-cases/update-candidates.use.case';


@Module({
  controllers: [CandidatesController],
  providers: [
    { provide: CANDIDATE_REPOSITORY, useClass: PrismaCandidateRepository },
    CreateCandidateUseCase,
    ListCandidatesByJobUseCase,
    ListCandidatesByCompanyUseCase,
    GetCandidateByIdUseCase,
    UpdateCandidateStatusUseCase,
    AnonymizeCandidateUseCase,
  ],
  exports: [CANDIDATE_REPOSITORY],
})
export class CandidatesModule { }
