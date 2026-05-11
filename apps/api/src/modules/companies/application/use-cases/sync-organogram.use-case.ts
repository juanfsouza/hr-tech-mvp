import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/database/prisma.service';
import { SyncOrganogramInput, SyncOrganogramOutput } from '../interfaces/sync-organogram.interface';
import { Either, right } from '@shared/domain/errors/either';

@Injectable()
export class SyncOrganogramUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: SyncOrganogramInput): Promise<Either<Error, SyncOrganogramOutput>> {
    const { companyId, nodes, personalityResults } = input;

    // Usar transação para garantir atomicidade
    await this.prisma.$transaction(async (tx) => {
      // 1. Limpar organograma atual da empresa (soft delete ou delete físico no onboarding)
      // No onboarding, como estamos "montando", podemos limpar e recriar
      await tx.collaborator.deleteMany({
        where: { companyId }
      });

      // 2. Criar colaboradores (sem parentId primeiro para evitar erros de FK)
      // Mapeamos os IDs do frontend para os IDs reais se necessário, 
      // mas aqui vamos assumir que o frontend gera UUIDs válidos.
      for (const node of nodes) {
        await tx.collaborator.create({
          data: {
            id: node.id,
            companyId,
            name: node.name,
            role: node.role,
            department: node.department,
            isActive: true,
          }
        });

        // 3. Salvar perfil psicométrico se existir
        const result = personalityResults[node.id];
        if (result && (result.disc || result.enneagram)) {
          await tx.psychProfile.upsert({
            where: { collaboratorId: node.id },
            create: {
              collaboratorId: node.id,
              discDominant: result.disc,
              enneagramType: result.enneagram ? parseInt(result.enneagram) : undefined,
            },
            update: {
              discDominant: result.disc,
              enneagramType: result.enneagram ? parseInt(result.enneagram) : undefined,
            }
          });
        }
      }

      // 4. Atualizar hierarquia (parentId)
      for (const node of nodes) {
        if (node.parentId) {
          await tx.collaborator.update({
            where: { id: node.id },
            data: { parentId: node.parentId }
          });
        }
      }
      
      // 5. Marcar onboarding como avançado (opcional, dependendo de como você controla)
      await tx.company.update({
        where: { id: companyId },
        data: { onboardingStatus: 'COMPLETED' }
      });
    });

    return right({
      success: true,
      count: nodes.length
    });
  }
}
