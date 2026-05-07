import { IsEmail, IsString, IsNotEmpty, MinLength, IsUUID, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@/modules/users/domain/entities/user.entity';

export class LoginDto {
  @ApiProperty({ example: 'admin@empresa.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'Senha@123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({ example: 'uuid-da-empresa' })
  @IsUUID()
  @IsOptional()
  companyId?: string;
}

export class RegisterDto {
  @ApiPropertyOptional({ example: 'uuid-da-empresa' })
  @IsUUID()
  @IsOptional()
  companyId?: string;

  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 'joao@empresa.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'Senha@123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({ enum: ['ADMIN', 'HR', 'VIEWER'], default: 'HR' })
  @IsOptional()
  @IsIn(['ADMIN', 'HR', 'VIEWER'])
  role?: UserRole;
}
