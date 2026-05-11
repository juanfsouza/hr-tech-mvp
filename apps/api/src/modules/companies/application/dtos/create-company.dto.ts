import { IsString, IsNotEmpty, Matches, IsOptional, IsUrl, MinLength, IsArray, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Empresa Exemplo LTDA' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  razaoSocial!: string;

  @ApiProperty({ example: '12.345.678/0001-95' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/, {
    message: 'CNPJ must be in format XX.XXX.XXX/XXXX-XX',
  })
  cnpj!: string;

  @ApiPropertyOptional({ example: 'https://empresa.com' })
  @IsOptional()
  @IsUrl({}, { message: 'websiteUrl must be a valid URL' })
  @Matches(/^https?:\/\/.+|^$/, { message: 'websiteUrl must be a valid URL or empty' })
  websiteUrl?: string;

  @ApiPropertyOptional({ example: 'https://s3.amazonaws.com/bucket/logos/my-logo.png' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiProperty({ example: 'uuid-do-usuario' })
  @IsString()
  @IsNotEmpty()
  userId!: string;
}

export class UpdateOnboardingDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  step?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyContext?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  perfilRitmo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  valores?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isComplete?: boolean;
}

export class UpdateCompanyDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  razaoSocial?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/, {
    message: 'CNPJ must be in format XX.XXX.XXX/XXXX-XX',
  })
  cnpj?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  websiteUrl?: string;
}
