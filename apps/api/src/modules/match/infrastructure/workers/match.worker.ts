import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { AnalyzeCandidateInput } from '@/modules/ai/application/interfaces/analyze-candidate-input.interface';
import { MatchService } from '../../application/match.service';

@Processor('match-analysis')
export class MatchWorker extends WorkerHost {
  private readonly logger = new Logger(MatchWorker.name);

  constructor(private readonly matchService: MatchService) {
    super();
  }

  async process(job: Job<AnalyzeCandidateInput>): Promise<void> {
    this.logger.log(`Processing match analysis job ${job.id} for candidate ${job.data.candidateId}`);

    try {
      const result = await this.matchService.runAnalysisPipeline(job.data);
      this.logger.log(`Match job ${job.id} completed: score=${result.overallScore}`);
    } catch (error) {
      this.logger.error(`Match job ${job.id} failed:`, error);
      throw error;
    }
  }
}
