import { CreateCollaboratorInput } from "@/modules/collaborators/application/interfaces/create-collaborator-input.interface";
import { CreateCollaboratorOutput } from "@/modules/collaborators/application/interfaces/create-collaborator-output.interface";
import { ICollaboratorRepository } from "@/modules/collaborators/domain/repositories/icollaborator-repository.interface";
import { ResourceAlreadyExistsError, EntityNotFoundError } from "@/shared/domain/errors/domain-errors";
import { Either, left, right } from "@/shared/domain/errors/either";
import { Injectable, Inject } from "@nestjs/common";
import { COLLABORATOR_REPOSITORY } from "../../domain/repositories/collaborator.repository.interface";
import { Collaborator } from "../../domain/entities/collaborator.entity";

@Injectable()
export class CreateCollaboratorUseCase {
    constructor(
        @Inject(COLLABORATOR_REPOSITORY) private readonly repo: ICollaboratorRepository,
    ) { }

    async execute(
        input: CreateCollaboratorInput,
    ): Promise<Either<ResourceAlreadyExistsError | EntityNotFoundError, CreateCollaboratorOutput>> {
        if (input.email) {
            const exists = await this.repo.existsByEmail(input.email, input.companyId);
            if (exists) return left(new ResourceAlreadyExistsError('Collaborator with this e-mail'));
        }

        if (input.parentId) {
            const parent = await this.repo.findById(input.parentId, input.companyId);
            if (!parent) return left(new EntityNotFoundError('Parent Collaborator', input.parentId));
        }

        const collaborator = Collaborator.create({
            companyId: input.companyId,
            name: input.name.trim(),
            email: input.email,
            role: input.role.trim(),
            department: input.department?.trim(),
            parentId: input.parentId,
        });

        await this.repo.save(collaborator);

        return right({ id: collaborator.id.value, name: collaborator.name, role: collaborator.role, parentId: collaborator.parentId });
    }
}