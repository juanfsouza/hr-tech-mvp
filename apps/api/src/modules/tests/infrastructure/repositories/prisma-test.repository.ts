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
    return r ? this.sessionToDomain(r as any) : null;
  }

  async findSessionById(id: string): Promise<TestSession | null> {
    const r = await this.prisma.testSession.findUnique({ where: { id } });
    return r ? this.sessionToDomain(r as any) : null;
  }

  async findSessionsByCompany(companyId: string): Promise<TestSession[]> {
    const records = await this.prisma.testSession.findMany({
      where: { companyId }
    });
    return records.map(r => this.sessionToDomain(r as any));
  }

  async saveSession(session: TestSession): Promise<void> {
    await this.prisma.testSession.create({
      data: {
        id: session.id.value,
        companyId: session.companyId,
        candidateId: session.candidateId,
        collaboratorId: session.collaboratorId,
        token: session.token,
        status: session.status,
        expiresAt: session.expiresAt,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        currentTest: session.currentTest,
        createdAt: session.createdAt,
      } as any,
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
        collaboratorId: session.collaboratorId,
      } as any,
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
        candidate: candidateId ? { connect: { id: candidateId } } : undefined,
        collaborator: collaboratorId ? { connect: { id: collaboratorId } } : undefined,
        discD: profile.discD && !isNaN(profile.discD) ? profile.discD : 0,
        discI: profile.discI && !isNaN(profile.discI) ? profile.discI : 0,
        discS: profile.discS && !isNaN(profile.discS) ? profile.discS : 0,
        discC: profile.discC && !isNaN(profile.discC) ? profile.discC : 0,
        discDominant: profile.discDominant,
        discSecondary: profile.discSecondary,
        enneagramType: profile.enneagramType,
        enneagramWing: profile.enneagramWing,
        enneagramLevel: profile.enneagramLevel,
        mbtiType: profile.mbtiType,
        bigFiveO: profile.bigFiveO && !isNaN(profile.bigFiveO) ? profile.bigFiveO : 0,
        bigFiveC: profile.bigFiveC && !isNaN(profile.bigFiveC) ? profile.bigFiveC : 0,
        bigFiveE: profile.bigFiveE && !isNaN(profile.bigFiveE) ? profile.bigFiveE : 0,
        bigFiveA: profile.bigFiveA && !isNaN(profile.bigFiveA) ? profile.bigFiveA : 0,
        bigFiveN: profile.bigFiveN && !isNaN(profile.bigFiveN) ? profile.bigFiveN : 0,
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
        collaboratorId: r.collaboratorId ?? undefined,
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
