import {
  Controller, Post, Get, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';
import { JwtAuthGuard } from '@shared/infrastructure/http/guards/jwt-auth.guard';
import { StorageService, StorageBucket } from '../services/storage.service';
import { Body } from '@nestjs/common';

class GetUploadUrlDto {
  @IsIn(['resumes', 'logos', 'reports']) folder!: StorageBucket;
  @IsString() extension!: string;
  @IsString() contentType!: string;
}

@ApiTags('Storage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('storage')
export class StorageController {
  constructor(private readonly storage: StorageService) {}

  @Post('upload-url')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obter URL presigned para upload direto (browser → S3)' })
  async getUploadUrl(@Body() dto: GetUploadUrlDto): Promise<{ uploadUrl: string; key: string }> {
    return this.storage.getUploadPresignedUrl(dto.folder, dto.extension, dto.contentType);
  }

  @Get('download-url')
  @ApiOperation({ summary: 'Obter URL presigned para download temporário' })
  @ApiQuery({ name: 'key', required: true })
  async getDownloadUrl(@Query('key') key: string): Promise<{ url: string }> {
    const url = await this.storage.getDownloadPresignedUrl(key);
    return { url };
  }
}
