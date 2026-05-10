import { IsString, IsNotEmpty, Matches, IsOptional, IsUrl, MinLength } from 'class-validator';
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

  @ApiProperty({ example: 'uuid-do-usuario' })
  @IsString()
  @IsNotEmpty()
  userId!: string;
}

export class UpdateOnboardingDto {
  @ApiProperty({ example: 1, enum: [1, 2, 3, 4] })
  step!: 1 | 2 | 3 | 4;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  websiteUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  address?: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };

  @ApiPropertyOptional()
  @IsOptional()
  context?: {
    companyProfile?: 'STARTUP' | 'CONSOLIDATED' | 'RESTRUCTURING' | 'OTHER';
    companyContext?: string;
    cultureValues?: string[];
    mainChallenges?: string;
    leadershipStyle?: string;
  };
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
