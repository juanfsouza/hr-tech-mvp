import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { appConfig, validateConfig, AppConfig } from './config/app.config';
import { CompaniesModule } from './modules/companies.module';
import { StorageModule } from './modules/storage.module';
import { UsersModule } from './modules/users.module';
import { DatabaseModule } from './modules/database.module';
import { AiModule } from './modules/ai.module';
import { AuthModule } from './modules/auth.module';
import { CandidatesModule } from './modules/candidates.module';
import { CollaboratorsModule } from './modules/collaborators.module';
import { JobsModule } from './modules/jobs.module';
import { MatchModule } from './modules/match.module';
import { NotificationsModule } from './modules/notifications.module';
import { TestsModule } from './modules/tests.module';
import { QueuesDashboardModule } from './modules/queues-dashboard.module';
import { PdfModule } from './modules/pdf.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { HealthController } from './modules/health/controllers/health.controller';

@Module({
  imports: [
    // ─── Configuração ──────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validate: validateConfig,
      envFilePath: ['.env.local', '.env', '../../.env', '../../../.env'],
    }),

    // ─── Rate Limiting ─────────────────────────────────────────────────────
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),

    // ─── Event Emitter (Domain Events) ────────────────────────────────────
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      maxListeners: 20,
      verboseMemoryLeak: true,
    }),

    // ─── Agendamento de Jobs ───────────────────────────────────────────────
    ScheduleModule.forRoot(),

    // ─── Filas (BullMQ + Redis) ────────────────────────────────────────────
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig>) => ({
        connection: {
          host: config.get('REDIS_HOST') ?? 'localhost',
          port: Number(config.get('REDIS_PORT') ?? 6379),
          password: config.get('REDIS_PASSWORD'),
        },
      }),
    }),

    // ─── Infraestrutura ────────────────────────────────────────────────────
    DatabaseModule,
    StorageModule,
    NotificationsModule,

    // ─── Módulos de Negócio ────────────────────────────────────────────────
    AuthModule,
    CompaniesModule,
    UsersModule,
    CollaboratorsModule,
    TestsModule,
    JobsModule,
    CandidatesModule,
    MatchModule,
    AiModule,
    PdfModule,
    QueuesDashboardModule,
    DashboardModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
