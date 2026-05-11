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

export class ForgotPasswordDto {
  @ApiProperty({ example: 'joao@empresa.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'uuid-do-token' })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({ example: 'NovaSenha@123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword!: string;
}
