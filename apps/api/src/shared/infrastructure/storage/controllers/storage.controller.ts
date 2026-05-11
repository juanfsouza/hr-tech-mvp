import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { StorageService, StorageBucket } from '../services/storage.service';
import { JwtAuthGuard } from '../../http/guards/jwt-auth.guard';

class GetUploadUrlDto {
  bucket!: StorageBucket;
  extension!: string;
  contentType!: string;
}

@ApiTags('Storage')
@Controller('storage')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload-url')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gerar URL assinada para upload de arquivos no S3' })
  @ApiBody({ type: GetUploadUrlDto })
  async getUploadUrl(@Body() dto: GetUploadUrlDto) {
    return this.storageService.getUploadPresignedUrl(
      dto.bucket,
      dto.extension,
      dto.contentType
    );
  }
}
