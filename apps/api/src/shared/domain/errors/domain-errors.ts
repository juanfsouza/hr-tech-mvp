/**
 * Domain errors base — erros de negócio tipados
 * Não são exceptions, são valores retornados via Either
 */

export abstract class DomainError {
  abstract readonly message: string;
  abstract readonly code: string;

  toString(): string {
    return `[${this.code}] ${this.message}`;
  }
}

// ─── Generic Domain Errors ─────────────────────────────────────────────────────

export class EntityNotFoundError extends DomainError {
  readonly message: string;
  readonly code = 'ENTITY_NOT_FOUND';

  constructor(entityName: string, id: string) {
    super();
    this.message = `${entityName} with id '${id}' not found.`;
  }
}

export class UnauthorizedError extends DomainError {
  readonly message = 'You are not authorized to perform this action.';
  readonly code = 'UNAUTHORIZED';
}

export class ForbiddenError extends DomainError {
  readonly message = 'You do not have permission to access this resource.';
  readonly code = 'FORBIDDEN';
}

export class InvalidCredentialsError extends DomainError {
  readonly message = 'Invalid e-mail or password.';
  readonly code = 'INVALID_CREDENTIALS';
}

export class ResourceAlreadyExistsError extends DomainError {
  readonly message: string;
  readonly code = 'RESOURCE_ALREADY_EXISTS';

  constructor(resource: string) {
    super();
    this.message = `${resource} already exists.`;
  }
}

export class InvalidValueObjectError extends DomainError {
  readonly message: string;
  readonly code = 'INVALID_VALUE_OBJECT';

  constructor(field: string, reason: string) {
    super();
    this.message = `Invalid ${field}: ${reason}`;
  }
}

export class BusinessRuleViolationError extends DomainError {
  readonly message: string;
  readonly code = 'BUSINESS_RULE_VIOLATION';

  constructor(rule: string) {
    super();
    this.message = rule;
  }
}
