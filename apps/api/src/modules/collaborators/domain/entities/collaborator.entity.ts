import { Entity } from '@shared/domain/value-objects/entity';
import { UniqueEntityID } from '@shared/domain/value-objects/unique-entity-id';
import { CollaboratorProps } from '@/interfaces/collaborator-props.interface';

export class Collaborator extends Entity<CollaboratorProps> {
  private constructor(props: CollaboratorProps, id?: UniqueEntityID) {
    super(props, id);
  }

  static create(
    props: Omit<CollaboratorProps, 'isActive' | 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID,
  ): Collaborator {
    return new Collaborator(
      { ...props, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      id,
    );
  }

  static reconstitute(props: CollaboratorProps, id: UniqueEntityID): Collaborator {
    return new Collaborator(props, id);
  }

  get companyId(): string { return this.props.companyId; }
  get name(): string { return this.props.name; }
  get email(): string | undefined { return this.props.email; }
  get role(): string { return this.props.role; }
  get department(): string | undefined { return this.props.department; }
  get parentId(): string | undefined { return this.props.parentId; }
  get isActive(): boolean { return this.props.isActive; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
  get deletedAt(): Date | undefined { return this.props.deletedAt; }

  isRoot(): boolean { return !this.props.parentId; }

  update(data: Partial<Pick<CollaboratorProps, 'name' | 'role' | 'department' | 'parentId' | 'email'>>): void {
    Object.assign(this.props, data);
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.deletedAt = new Date();
    this.props.updatedAt = new Date();
  }
}
