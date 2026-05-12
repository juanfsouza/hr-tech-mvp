import {
  Controller, Post, Get, Patch, Delete, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus,
  NotFoundException, BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@shared/infrastructure/http/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '@shared/infrastructure/http/decorators/current-user.decorator';
import {
  CreateJobUseCase,
  ListJobsUseCase,
  GetJobByIdUseCase,
  GenerateJobDescriptionUseCase,
  PublishJobUseCase,
  CloseJobUseCase,
  PauseJobUseCase,
  DeleteJobUseCase,
  UpdateJobUseCase,
} from '@modules/jobs/application/use-cases/jobs.use-cases';
import { CreateJobDto } from '../application/dtos/create-job.dto';


@ApiTags('Jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('jobs')
export class JobsController {
  constructor(
    private readonly createJobUseCase: CreateJobUseCase,
    private readonly listJobsUseCase: ListJobsUseCase,
    private readonly getJobByIdUseCase: GetJobByIdUseCase,
    private readonly generateJdUseCase: GenerateJobDescriptionUseCase,
    private readonly publishJobUseCase: PublishJobUseCase,
    private readonly closeJobUseCase: CloseJobUseCase,
    private readonly pauseJobUseCase: PauseJobUseCase,
    private readonly deleteJobUseCase: DeleteJobUseCase,
    private readonly updateJobUseCase: UpdateJobUseCase,
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar nova vaga' })
  async create(
    @Body() dto: CreateJobDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ id: string; title: string; status: string }> {
    console.log('[JobsController] Criando vaga. User:', JSON.stringify(user));
    console.log('[JobsController] Payload recebido:', JSON.stringify(dto));

    if (!user.companyId) {
      console.error('[JobsController] ERRO: Usuário sem companyId no Token!');
    }

    const result = await this.createJobUseCase.execute({
      companyId: user.companyId!,
      creatorId: user.id,
      ...dto,
    });
    return result.value;
  }

  @Get()
  @ApiOperation({ summary: 'Listar vagas da empresa (cursor-based pagination)' })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'take', required: false, type: Number })
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('cursor') cursor?: string,
    @Query('take') take?: string,
  ): Promise<object> {
    if (!user.companyId) {
      return { items: [], nextCursor: null, hasNextPage: false };
    }

    const result = await this.listJobsUseCase.execute({
      companyId: user.companyId,
      cursor,
      take: take ? parseInt(take, 10) : undefined,
    });
    return result.value;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter vaga por ID' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<object> {
    const result = await this.getJobByIdUseCase.execute(id, user.companyId!);
    if (result.isLeft()) {
      if (result.value.code === 'ENTITY_NOT_FOUND') throw new NotFoundException(result.value.message);
      throw new BadRequestException(result.value.message);
    }
    return result.value;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados da vaga' })
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateJobDto>,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ id: string }> {
    const result = await this.updateJobUseCase.execute(id, user.companyId!, dto);
    if (result.isLeft()) throw new NotFoundException(result.value.message);
    return result.value;
  }

  @Post(':id/generate-jd')
  @ApiOperation({ summary: 'Gerar Job Description com IA (Claude)' })
  async generateJd(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ jd: string }> {
    const result = await this.generateJdUseCase.execute(id, user.companyId!);
    if (result.isLeft()) {
      if (result.value.code === 'ENTITY_NOT_FOUND') throw new NotFoundException(result.value.message);
      throw new BadRequestException(result.value.message);
    }
    return result.value;
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publicar vaga (DRAFT → ACTIVE)' })
  async publish(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ status: string }> {
    const result = await this.publishJobUseCase.execute(id, user.companyId!);
    if (result.isLeft()) throw new NotFoundException(result.value.message);
    return result.value;
  }

  @Patch(':id/pause')
  @ApiOperation({ summary: 'Pausar vaga' })
  async pause(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ status: string }> {
    const result = await this.pauseJobUseCase.execute(id, user.companyId!);
    if (result.isLeft()) throw new NotFoundException(result.value.message);
    return result.value;
  }

  @Patch(':id/close')
  @ApiOperation({ summary: 'Encerrar vaga' })
  async close(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ status: string }> {
    const result = await this.closeJobUseCase.execute(id, user.companyId!);
    if (result.isLeft()) throw new NotFoundException(result.value.message);
    return result.value;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir vaga' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    const result = await this.deleteJobUseCase.execute(id, user.companyId!);
    if (result.isLeft()) throw new NotFoundException(result.value.message);
  }
}
