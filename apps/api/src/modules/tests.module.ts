import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TEST_REPOSITORY } from './tests/domain/repositories/test.repository.interface';
import { PrismaTestRepository } from './tests/infrastructure/repositories/prisma-test.repository';
import { TestsController } from './tests/controllers/tests.controller';
import { CompleteTestUseCase } from './tests/application/use-cases/complete-session.use-case';
import { CreateTestSessionUseCase } from './tests/application/use-cases/create-session.use-case';
import { GetTestSessionByTokenUseCase } from './tests/application/use-cases/list.session.use-case';
import { SaveProgressUseCase } from './tests/application/use-cases/save-session.use-case';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'match-analysis' }),
  ],
  controllers: [TestsController],
  providers: [
    { provide: TEST_REPOSITORY, useClass: PrismaTestRepository },
    CreateTestSessionUseCase,
    GetTestSessionByTokenUseCase,
    SaveProgressUseCase,
    CompleteTestUseCase,
  ],
  exports: [TEST_REPOSITORY, CreateTestSessionUseCase],
})
export class TestsModule { }
