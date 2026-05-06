import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/database/prisma.service';
import { Collaborator } from '@modules/collaborators/domain/entities/collaborator.entity';
import { UniqueEntityID } from '@shared/domain/value-objects/unique-entity-id';
import { ICollaboratorRepository } from '@/interfaces/icollaborator-repository.interface';

interface PrismaCollaboratorRecord {
  id: string;
  companyId: string;
  name: string;
  email: string | null;
  role: string;
  department: string | null;
  parentId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

@Injectable()
export class PrismaCollaboratorRepository implements ICollaboratorRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findById(id: string, companyId: string): Promise<Collaborator | null> {
    const r = await this.prisma.collaborator.findFirst({
      where: { id, companyId, deletedAt: null },
    });
    return r ? this.toDomain(r) : null;
  }

  async findByCompany(companyId: string): Promise<Collaborator[]> {
    const records = await this.prisma.collaborator.findMany({
      where: { companyId, deletedAt: null, isActive: true },
      orderBy: { createdAt: 'asc' },
    });
    return records.map((r: PrismaCollaboratorRecord) => this.toDomain(r));
  }

  async findChildren(parentId: string, companyId: string): Promise<Collaborator[]> {
    const records = await this.prisma.collaborator.findMany({
      where: { parentId, companyId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
    return records.map((r: PrismaCollaboratorRecord) => this.toDomain(r));
  }

  async save(collaborator: Collaborator): Promise<void> {
    await this.prisma.collaborator.create({
      data: {
        id: collaborator.id.value,
        companyId: collaborator.companyId,
        name: collaborator.name,
        email: collaborator.email,
        role: collaborator.role,
        department: collaborator.department,
        parentId: collaborator.parentId,
        isActive: collaborator.isActive,
        createdAt: collaborator.createdAt,
        updatedAt: collaborator.updatedAt,
      },
    });
  }

  async update(collaborator: Collaborator): Promise<void> {
    await this.prisma.collaborator.update({
      where: { id: collaborator.id.value },
      data: {
        name: collaborator.name,
        email: collaborator.email,
        role: collaborator.role,
        department: collaborator.department,
        parentId: collaborator.parentId,
        isActive: collaborator.isActive,
        deletedAt: collaborator.deletedAt,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.collaborator.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async existsByEmail(email: string, companyId: string): Promise<boolean> {
    const count = await this.prisma.collaborator.count({
      where: { email, companyId, deletedAt: null },
    });
    return count > 0;
  }

  private toDomain(r: PrismaCollaboratorRecord): Collaborator {
    return Collaborator.reconstitute(
      {
        companyId: r.companyId,
        name: r.name,
        email: r.email ?? undefined,
        role: r.role,
        department: r.department ?? undefined,
        parentId: r.parentId ?? undefined,
        isActive: r.isActive,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        deletedAt: r.deletedAt ?? undefined,
      },
      new UniqueEntityID(r.id),
    );
  }
}
