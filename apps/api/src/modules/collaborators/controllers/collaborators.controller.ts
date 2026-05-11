import {
  Controller, Post, Get, Patch, Delete, Body, Param,
  UseGuards, HttpCode, HttpStatus,
  ConflictException, BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JwtAuthGuard } from '@shared/infrastructure/http/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '@shared/infrastructure/http/decorators/current-user.decorator';
import { CreateCollaboratorUseCase } from '../application/use-cases/create.collaborator.use-case';
import { UpdateCollaboratorUseCase } from '../application/use-cases/update.collaborator.use-case';
import { DeleteCollaboratorUseCase } from '../application/use-cases/delete.collaborator.use-case';
import { OrgChartNode } from '@/modules/collaborators/application/interfaces/org-chart-node.interface';
import { GetOrgChartUseCase } from '../application/use-cases/list.collaborato.use-case';
import { ListCollaboratorsUseCase } from '../application/use-cases/list.collaborators.use-case';

class CreateCollaboratorDto {
  @ApiProperty() @IsString() @IsNotEmpty() name!: string;
  @ApiProperty() @IsString() @IsNotEmpty() role!: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() department?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() parentId?: string;
}

@ApiTags('Collaborators')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies/:companyId/collaborators')
export class CollaboratorsController {
  constructor(
    private readonly createCollaborator: CreateCollaboratorUseCase,
    private readonly updateCollaborator: UpdateCollaboratorUseCase,
    private readonly deleteCollaborator: DeleteCollaboratorUseCase,
    private readonly getOrgChart: GetOrgChartUseCase,
    private readonly listCollaborators: ListCollaboratorsUseCase,
  ) { }

  @Get()
  @ApiOperation({ summary: 'Listar todos os colaboradores da empresa (flat)' })
  async list(
    @Param('companyId') companyId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<any[]> {
    if (user.companyId !== companyId) throw new ForbiddenException();
    return this.listCollaborators.execute(companyId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Adicionar colaborador ao organograma' })
  async create(
    @Param('companyId') companyId: string,
    @Body() dto: CreateCollaboratorDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ id: string; name: string }> {
    if (user.companyId !== companyId) throw new ForbiddenException();

    const result = await this.createCollaborator.execute({ companyId, ...dto });
    if (result.isLeft()) {
      const err = result.value;
      if (err.code === 'RESOURCE_ALREADY_EXISTS') throw new ConflictException(err.message);
      throw new BadRequestException(err.message);
    }
    return { id: result.value.id, name: result.value.name };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados ou posição no organograma' })
  async update(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateCollaboratorDto>,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ success: boolean }> {
    if (user.companyId !== companyId) throw new ForbiddenException();

    const result = await this.updateCollaborator.execute({
      id,
      companyId,
      ...dto,
    });

    if (result.isLeft()) {
      throw new BadRequestException(result.value.message);
    }
    return result.value;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover colaborador do organograma' })
  async remove(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ success: boolean }> {
    if (user.companyId !== companyId) throw new ForbiddenException();

    const result = await this.deleteCollaborator.execute(id, companyId);
    if (result.isLeft()) {
      throw new BadRequestException(result.value.message);
    }
    return result.value;
  }

  @Get('org-chart')
  @ApiOperation({ summary: 'Retornar organograma em árvore hierárquica' })
  async orgChart(
    @Param('companyId') companyId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OrgChartNode[]> {
    if (user.companyId !== companyId) throw new ForbiddenException();
    return this.getOrgChart.execute(companyId);
  }
}
