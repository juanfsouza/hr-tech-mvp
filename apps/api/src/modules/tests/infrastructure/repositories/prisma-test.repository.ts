import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ITestRepository } from '@/modules/tests/domain/repositories/itest-repository.interface';
import { SaveResponseInput } from '@/modules/tests/application/interfaces/save-response-input.interface';
import { PsychProfileData } from '@/modules/tests/domain/interfaces/psych-profile-data.interface';
import { UniqueEntityID } from '@/shared/domain/value-objects';
import { PrismaSessionRecord } from '../interfaces/prisma.teste.interface';
import { PrismaService } from '@/shared/infrastructure/database/prisma.service';
import { TestSession, TestType, TestSessionStatus } from '../../domain/entities/test-session.entity';

@Injectable()
export class PrismaTestRepository implements ITestRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findSessionByToken(token: string): Promise<TestSession | null> {
    const r = await this.prisma.testSession.findUnique({ where: { token } });
    return r ? this.sessionToDomain(r) : null;
  }

  async findSessionById(id: string): Promise<TestSession | null> {
    const r = await this.prisma.testSession.findUnique({ where: { id } });
    return r ? this.sessionToDomain(r) : null;
  }

  async saveSession(session: TestSession): Promise<void> {
    await this.prisma.testSession.create({
      data: {
        id: session.id.value,
        companyId: session.companyId,
        candidateId: session.candidateId,
        token: session.token,
        status: session.status,
        expiresAt: session.expiresAt,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        currentTest: session.currentTest,
        createdAt: session.createdAt,
      },
    });
  }

  async updateSession(session: TestSession): Promise<void> {
    await this.prisma.testSession.update({
      where: { id: session.id.value },
      data: {
        status: session.status,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        currentTest: session.currentTest,
        candidateId: session.candidateId,
      },
    });
  }

  async expireOldSessions(): Promise<number> {
    const result = await this.prisma.testSession.updateMany({
      where: { status: 'PENDING', expiresAt: { lt: new Date() } },
      data: { status: 'EXPIRED' },
    });
    return result.count;
  }

  async upsertResponse(input: SaveResponseInput): Promise<void> {
    await this.prisma.testResponse.upsert({
      where: {
        sessionId_testType_questionId: {
          sessionId: input.sessionId,
          testType: input.testType,
          questionId: input.questionId,
        },
      },
      update: { answer: input.answer, answeredAt: new Date() },
      create: {
        id: randomUUID(),
        sessionId: input.sessionId,
        testType: input.testType,
        questionId: input.questionId,
        answer: input.answer,
        answeredAt: new Date(),
      },
    });
  }

  async findResponses(
    sessionId: string,
    testType: TestType,
  ): Promise<Array<{ questionId: string; answer: string }>> {
    return this.prisma.testResponse.findMany({
      where: { sessionId, testType },
      select: { questionId: true, answer: true },
      orderBy: { answeredAt: 'asc' },
    });
  }

  async savePsychProfile(
    candidateId: string | undefined,
    collaboratorId: string | undefined,
    profile: PsychProfileData,
  ): Promise<string> {
    const created = await this.prisma.psychProfile.create({
      data: {
        id: randomUUID(),
        candidateId,
        collaboratorId,
        ...profile,
        completedAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return created.id;
  }

  private sessionToDomain(r: PrismaSessionRecord): TestSession {
    return TestSession.reconstitute(
      {
        companyId: r.companyId,
        candidateId: r.candidateId ?? undefined,
        token: r.token,
        status: r.status as TestSessionStatus,
        expiresAt: r.expiresAt,
        startedAt: r.startedAt ?? undefined,
        completedAt: r.completedAt ?? undefined,
        currentTest: r.currentTest as TestType | undefined,
        createdAt: r.createdAt,
      },
      new UniqueEntityID(r.id),
    );
  }
}
