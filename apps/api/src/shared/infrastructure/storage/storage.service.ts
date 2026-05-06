import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AppConfig } from 'src/config/app.config';
import { randomUUID } from 'node:crypto';

export type StorageBucket = 'resumes' | 'logos' | 'reports';

/**
 * StorageService — wrapper S3/Cloudflare R2 com presigned URLs
 * Nunca retorna URL direta — sempre presigned com expiração
 */
@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly logger = new Logger(StorageService.name);

  constructor(config: ConfigService<AppConfig>) {
    this.bucket = config.getOrThrow('S3_BUCKET_NAME');

    this.client = new S3Client({
      region: config.get('S3_REGION') ?? 'auto',
      endpoint: config.get('S3_ENDPOINT') ?? undefined,
      credentials: {
        accessKeyId: config.getOrThrow('S3_ACCESS_KEY_ID'),
        secretAccessKey: config.getOrThrow('S3_SECRET_ACCESS_KEY'),
      },
    });
  }

  /**
   * Gerar presigned URL para upload direto (browser → S3, sem passar pelo servidor)
   */
  async getUploadPresignedUrl(
    folder: StorageBucket,
    extension: string,
    contentType: string,
    expiresIn = 300,
  ): Promise<{ uploadUrl: string; key: string }> {
    const key = `${folder}/${randomUUID()}.${extension}`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn });
    return { uploadUrl, key };
  }

  /**
   * Gerar presigned URL para download (acesso temporário)
   */
  async getDownloadPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.client, command, { expiresIn });
  }

  async delete(key: string): Promise<void> {
    this.logger.log(`Storage soft-delete: ${key}`);
  }
}
