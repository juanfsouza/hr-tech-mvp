import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MatchService } from './match/application/match.service';
import { MatchWorker } from './match/infrastructure/workers/match.worker';
import { MatchController } from './match/presentation/match.controller';
import { JobsModule } from './jobs.module';
import { TestsModule } from './tests.module';
import { CandidatesModule } from './candidates.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'match-analysis' }),
    CandidatesModule,
    JobsModule,
    TestsModule,
  ],
  controllers: [MatchController],
  providers: [MatchService, MatchWorker],
  exports: [MatchService],
})
export class MatchModule { }
