import { z } from 'zod';
import { registerAs } from '@nestjs/config';

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3333),
  API_URL: z.string().url(),
  FRONTEND_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  ENCRYPTION_KEY: z.string().min(32),
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-'),
  // Aceita OpenAI (sk-) ou xAI/Grok (xai-)
  OPENAI_API_KEY: z.string().min(10),
  // Endpoint customizável: use https://api.x.ai/v1 para Grok
  OPENAI_BASE_URL: z.string().url().optional(),
  S3_ENDPOINT: z.string().url(),
  S3_REGION: z.string().default('auto'),
  S3_ACCESS_KEY_ID: z.string().min(1),
  S3_SECRET_ACCESS_KEY: z.string().min(1),
  S3_BUCKET_NAME: z.string().min(1),
  S3_PUBLIC_URL: z.string().url(),
  RESEND_API_KEY: z.string().startsWith('re_'),
  EMAIL_FROM: z.string().email().default('noreply@saasrh.app'),
  EMAIL_FROM_NAME: z.string().default('RH TECH'),
  THROTTLE_TTL: z.coerce.number().default(60),
  THROTTLE_LIMIT: z.coerce.number().default(100),
  TEST_LINK_EXPIRY_HOURS: z.coerce.number().default(72),
  CANDIDATE_PORTAL_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CALLBACK_URL: z.string().url(),
});

export type AppConfig = z.infer<typeof configSchema>;

export function validateConfig(config: Record<string, unknown>): AppConfig {
  const result = configSchema.safeParse(config);
  if (!result.success) {
    const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('\n');
    throw new Error(`❌ Configuração inválida:\n${errors}`);
  }
  return result.data;
}

export const appConfig = registerAs('app', (): AppConfig => {
  return validateConfig(process.env as Record<string, unknown>);
});
