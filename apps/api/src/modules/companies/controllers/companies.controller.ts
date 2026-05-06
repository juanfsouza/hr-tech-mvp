import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ConflictException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@shared/infrastructure/http/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '@shared/infrastructure/http/decorators/current-user.decorator';
import { CreateCompanyUseCase } from '@modules/companies/application/use-cases/create-company.use-case';
import { UpdateOnboardingUseCase } from '@modules/companies/application/use-cases/update-onboarding.use-case';
import { GetCompanyUseCase } from '@modules/companies/application/use-cases/get-company.use-case';
import { GetCompanyOutput } from '@/interfaces/get-company-output.interface';
import { CreateCompanyDto, UpdateOnboardingDto } from '../application/dtos/create-company.dto';

@ApiTags('Companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly createCompany: CreateCompanyUseCase,
    private readonly updateOnboarding: UpdateOnboardingUseCase,
    private readonly getCompany: GetCompanyUseCase,
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar nova empresa (passo 1 do onboarding)' })
  async create(@Body() dto: CreateCompanyDto): Promise<{ companyId: string; cnpj: string }> {
    const result = await this.createCompany.execute({
      razaoSocial: dto.razaoSocial,
      cnpj: dto.cnpj,
      websiteUrl: dto.websiteUrl,
    });

    if (result.isLeft()) {
      const err = result.value;
      if (err.code === 'RESOURCE_ALREADY_EXISTS') throw new ConflictException(err.message);
      throw new BadRequestException(err.message);
    }

    return { companyId: result.value.companyId, cnpj: result.value.cnpj };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter dados da empresa autenticada' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GetCompanyOutput> {
    if (user.companyId !== id && user.role !== 'ADMIN') {
      throw new ForbiddenException();
    }

    const result = await this.getCompany.execute(id);
    if (result.isLeft()) throw new NotFoundException(result.value.message);

    return result.value;
  }

  @Patch(':id/onboarding')
  @ApiOperation({ summary: 'Avançar step do wizard de onboarding' })
  async advanceOnboarding(
    @Param('id') id: string,
    @Body() dto: UpdateOnboardingDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ onboardingStatus: string; isComplete: boolean }> {
    if (user.companyId !== id) throw new ForbiddenException();

    const result = await this.updateOnboarding.execute({
      companyId: id,
      ...dto,
    });

    if (result.isLeft()) {
      const err = result.value;
      if (err.code === 'ENTITY_NOT_FOUND') throw new NotFoundException(err.message);
      throw new BadRequestException(err.message);
    }

    return {
      onboardingStatus: result.value.onboardingStatus,
      isComplete: result.value.isComplete,
    };
  }
}
