import { ITokenRepository } from '@/interfaces/itoken-repository.interface';
import { SaveTokenInput } from '@/interfaces/save-token-input.interface';
import { StoredToken } from '@/interfaces/stored-token.interface';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/database/prisma.service';


@Injectable()
export class PrismaTokenRepository implements ITokenRepository {
  constructor(private readonly prisma: PrismaService) { }

  async save(input: SaveTokenInput): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        userId: input.userId,
        token: input.token,
        expiresAt: input.expiresAt,
      },
    });
  }

  async findByToken(token: string): Promise<StoredToken | null> {
    const record = await this.prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!record) return null;

    return {
      id: record.id,
      userId: record.userId,
      token: record.token,
      expiresAt: record.expiresAt,
      revokedAt: record.revokedAt ?? undefined,
      createdAt: record.createdAt,
    };
  }

  async revoke(token: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { token },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllByUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async deleteExpired(): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }
}
