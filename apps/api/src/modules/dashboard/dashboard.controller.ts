import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@shared/infrastructure/http/guards/jwt-auth.guard';
import { CurrentUser } from '@/shared/infrastructure/http/decorators/current-user.decorator';
import { AuthenticatedUser } from '@/shared/infrastructure/http/interfaces/authenticated-user.interface';
import { PrismaService } from '@/shared/infrastructure/database/prisma.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly prisma: PrismaService) { }

  @Get('stats')
  @ApiOperation({ summary: 'Obter estatísticas reais do dashboard' })
  async getStats(@CurrentUser() user: AuthenticatedUser) {
    const companyId = user.companyId;

    if (!companyId) {
      return {
        activeJobs: 0,
        totalCandidates: 0,
        avgMatch: 0,
        testsCompleted: 0,
        recentActivity: [],
      };
    }

    const [activeJobs, totalCandidates, candidatesWithMatch, auditLogs] = await Promise.all([
      this.prisma.job.count({ where: { companyId, status: 'ACTIVE', deletedAt: null } }),
      this.prisma.candidate.count({ where: { companyId, deletedAt: null } }),
      this.prisma.match.findMany({
        where: { companyId },
        select: { overallScore: true },
      }),
      this.prisma.auditLog.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const testsCompleted = candidatesWithMatch.length;
    const avgMatch = testsCompleted > 0
      ? Math.round(candidatesWithMatch.reduce((acc, m) => acc + m.overallScore, 0) / testsCompleted)
      : 0;

    return {
      activeJobs,
      totalCandidates,
      avgMatch,
      testsCompleted,
      recentActivity: auditLogs.map(log => ({
        id: log.id,
        action: log.action,
        details: (log.metadata as any)?.details || log.action,
        createdAt: log.createdAt,
      })),
    };
  }

  @Get('notifications')
  @ApiOperation({ summary: 'Listar notificações recentes' })
  async getNotifications(@CurrentUser() user: AuthenticatedUser) {
    const companyId = user.companyId;

    if (!companyId) return [];

    const notifications = await this.prisma.auditLog.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return notifications.map(log => ({
      id: log.id,
      action: log.action,
      details: (log.metadata as any)?.details || log.action,
      createdAt: log.createdAt,
    }));
  }
}
