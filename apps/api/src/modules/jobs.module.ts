import { Module } from '@nestjs/common';
import { JOB_REPOSITORY } from './jobs/domain/repositories/job.repository.interface';
import { PrismaJobRepository } from './jobs/infrastructure/repositories/prisma-job.repository';
import { JobsController } from './jobs/controllers/jobs.controller';
import { AiModule } from './ai.module';
import { CompaniesModule } from './companies.module';
import { CreateJobUseCase, ListJobsUseCase, GetJobByIdUseCase, GenerateJobDescriptionUseCase, PublishJobUseCase, CloseJobUseCase } from './jobs/application/use-cases/jobs.use-cases';


@Module({
  imports: [CompaniesModule, AiModule],
  controllers: [JobsController],
  providers: [
    { provide: JOB_REPOSITORY, useClass: PrismaJobRepository },
    CreateJobUseCase,
    ListJobsUseCase,
    GetJobByIdUseCase,
    GenerateJobDescriptionUseCase,
    PublishJobUseCase,
    CloseJobUseCase,
  ],
  exports: [JOB_REPOSITORY],
})
export class JobsModule { }
