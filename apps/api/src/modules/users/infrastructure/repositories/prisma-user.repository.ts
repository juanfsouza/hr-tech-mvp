import { Injectable } from '@nestjs/common';
import { User, UserRole } from '@modules/users/domain/entities/user.entity';
import { Email } from '@shared/domain/value-objects/email.vo';
import { Password } from '@shared/domain/value-objects/password.vo';
import { UniqueEntityID } from '@shared/domain/value-objects/unique-entity-id';
import { IUserRepository } from '@/modules/users/domain/repositories/iuser-repository.interface';
import { PrismaUserRecord } from '../interfaces/user.interface';
import { PrismaService } from '@/shared/infrastructure/database/prisma.service';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const record = await this.prisma.user.findFirst({
      where: { email: email.value, deletedAt: null },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByCompany(companyId: string, cursor?: string, take = 20): Promise<User[]> {
    const records = await this.prisma.user.findMany({
      where: { companyId, deletedAt: null, isActive: true },
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'asc' },
    });
    return records.map((r: PrismaUserRecord) => this.toDomain(r));
  }

  async save(user: User): Promise<void> {
    await this.prisma.user.create({
      data: {
        id: user.id.value,
        companyId: user.companyId,
        email: user.email.value,
        passwordHash: user.password.getRawValue(),
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  }

  async update(user: User): Promise<void> {
    await this.prisma.user.update({
      where: { id: user.id.value },
      data: {
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        companyId: user.companyId,
        deletedAt: user.deletedAt,
        updatedAt: new Date(),

        ...(user.password.isHashed
          ? { passwordHash: user.password.getRawValue() }
          : {}),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email: email.value, deletedAt: null },
    });
    return count > 0;
  }

  async countByCompany(companyId: string): Promise<number> {
    return this.prisma.user.count({
      where: { companyId, deletedAt: null, isActive: true },
    });
  }

  private toDomain(record: PrismaUserRecord): User {
    const emailOrError = Email.create(record.email);
    if (emailOrError.isLeft()) {
      throw new Error(`Invalid email in database: ${record.email}`);
    }

    return User.reconstitute(
      {
        companyId: record.companyId,
        email: emailOrError.value,
        password: Password.createHashed(record.passwordHash),
        name: record.name,
        role: record.role as UserRole,
        avatarUrl: record.avatarUrl ?? undefined,
        lastLoginAt: record.lastLoginAt ?? undefined,
        isActive: record.isActive,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        deletedAt: record.deletedAt ?? undefined,
      },
      new UniqueEntityID(record.id),
    );
  }
}
