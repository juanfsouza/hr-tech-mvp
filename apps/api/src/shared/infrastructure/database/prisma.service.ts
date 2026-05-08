import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@saas-rh/database';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('✅ Conectado ao PostgreSQL via Prisma');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('🔌 Desconectado do PostgreSQL');
  }

  async cleanDatabase(): Promise<void> {
    if (process.env['NODE_ENV'] !== 'test') return;
    
    const models = Reflect.ownKeys(this).filter((key) => 
      typeof key === 'string' && !key.startsWith('_') && !key.startsWith('$')
    );

    for (const model of models) {
      await (this as any)[model].deleteMany();
    }
  }
}
