import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TEST_REPOSITORY } from './tests/domain/repositories/test.repository.interface';
import { PrismaTestRepository } from './tests/infrastructure/repositories/prisma-test.repository';
import {
  CreateTestSessionUseCase,
  GetTestSessionByTokenUseCase,
  SaveProgressUseCase,
  CompleteTestUseCase,
} from './tests/application/use-cases/tests.use-cases';
import { TestsController } from './tests/presentation/tests.controller';

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
export class TestsModule {}
