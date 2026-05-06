import {
  Controller, Post, Get, Patch, Delete, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus,
  NotFoundException, ConflictException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@shared/infrastructure/http/guards/jwt-auth.guard';
import { CreateCandidateDto } from '@/dtos/create-candidate.dto';
import { UpdateStatusDto } from '../application/dtos/update-status.dto';
import { CreateCandidateUseCase } from '../application/use-cases/create-candidates.use-case';
import { GetCandidateByIdUseCase, ListCandidatesByJobUseCase } from '../application/use-cases/list-candidates.use-case';
import { AuthenticatedUser } from '@/interfaces/authenticated-user.interface';
import { CurrentUser } from '@/shared/infrastructure/http/decorators/current-user.decorator';
import { AnonymizeCandidateUseCase } from '../application/use-cases/anonymize-candidate.use-case';
import { UpdateCandidateStatusUseCase } from '../application/use-cases/update-candidates.use.case';



@ApiTags('Candidates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('candidates')
export class CandidatesController {
  constructor(
    private readonly createCandidateUseCase: CreateCandidateUseCase,
    private readonly listCandidatesUseCase: ListCandidatesByJobUseCase,
    private readonly getCandidateUseCase: GetCandidateByIdUseCase,
    private readonly updateStatusUseCase: UpdateCandidateStatusUseCase,
    private readonly anonymizeUseCase: AnonymizeCandidateUseCase,
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cadastrar candidato' })
  async create(
    @Body() dto: CreateCandidateDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ id: string; name: string; email: string }> {
    const result = await this.createCandidateUseCase.execute({
      companyId: user.companyId,
      ...dto,
    });
    if (result.isLeft()) throw new ConflictException(result.value.message);
    return result.value;
  }

  @Get('job/:jobId')
  @ApiOperation({ summary: 'Listar candidatos por vaga (cursor-based pagination)' })
  async listByJob(
    @Param('jobId') jobId: string,
    @Query('cursor') cursor: string | undefined,
    @Query('take') take: string | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<object> {
    const result = await this.listCandidatesUseCase.execute({
      jobId,
      companyId: user.companyId,
      cursor,
      take: take ? parseInt(take, 10) : undefined,
    });
    return result.value;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter candidato por ID' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<object> {
    const result = await this.getCandidateUseCase.execute(id, user.companyId);
    if (result.isLeft()) throw new NotFoundException(result.value.message);
    return result.value;
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar status do candidato no pipeline' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ status: string }> {
    const result = await this.updateStatusUseCase.execute(id, user.companyId, dto.status);
    if (result.isLeft()) throw new NotFoundException(result.value.message);
    return result.value;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Anonimizar candidato (LGPD — direito ao esquecimento)' })
  async anonymize(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    const result = await this.anonymizeUseCase.execute(id, user.companyId);
    if (result.isLeft()) throw new NotFoundException(result.value.message);
  }
}
