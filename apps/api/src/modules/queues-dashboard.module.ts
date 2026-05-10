import { Module } from '@nestjs/common';
import { BullBoardModule } from '@bull-board/nestjs';
import { FastifyAdapter } from '@bull-board/fastify';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

@Module({
  imports: [
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: FastifyAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'match-analysis',
      adapter: BullMQAdapter as any,
    }),
  ],
})
export class QueuesDashboardModule { }
