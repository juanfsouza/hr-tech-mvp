import { Entity } from '@shared/domain/value-objects/entity';
import { UniqueEntityID } from '@shared/domain/value-objects/unique-entity-id';
import { Email } from '@shared/domain/value-objects/email.vo';
import { Password } from '@shared/domain/value-objects/password.vo';
import { UserProps } from '@/interfaces/user-props.interface';

export type UserRole = 'ADMIN' | 'HR' | 'VIEWER';

export class User extends Entity<UserProps> {
  private constructor(props: UserProps, id?: UniqueEntityID) {
    super(props, id);
  }

  static create(props: Omit<UserProps, 'createdAt' | 'updatedAt' | 'isActive'>, id?: UniqueEntityID): User {
    return new User(
      {
        ...props,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id,
    );
  }

  static reconstitute(props: UserProps, id: UniqueEntityID): User {
    return new User(props, id);
  }

  // ─── Getters ──────────────────────────────────────────────────────────────

  get companyId(): string { return this.props.companyId; }
  get email(): Email { return this.props.email; }
  get password(): Password { return this.props.password; }
  get name(): string { return this.props.name; }
  get role(): UserRole { return this.props.role; }
  get avatarUrl(): string | undefined { return this.props.avatarUrl; }
  get lastLoginAt(): Date | undefined { return this.props.lastLoginAt; }
  get isActive(): boolean { return this.props.isActive; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
  get deletedAt(): Date | undefined { return this.props.deletedAt; }

  // ─── Comportamento ────────────────────────────────────────────────────────

  recordLogin(): void {
    this.props.lastLoginAt = new Date();
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.deletedAt = new Date();
    this.props.updatedAt = new Date();
  }

  updatePassword(newPassword: Password): void {
    this.props.password = newPassword;
    this.props.updatedAt = new Date();
  }

  changeRole(role: UserRole): void {
    this.props.role = role;
    this.props.updatedAt = new Date();
  }

  isAdmin(): boolean {
    return this.props.role === 'ADMIN';
  }

  canManageHR(): boolean {
    return this.props.role === 'ADMIN' || this.props.role === 'HR';
  }
}
