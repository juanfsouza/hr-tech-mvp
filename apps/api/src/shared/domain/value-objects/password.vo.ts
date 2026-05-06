import { ValueObject } from './value-object';
import { Either, left, right } from '../errors/either';
import { InvalidValueObjectError } from '../errors/domain-errors';

interface PasswordProps {
  value: string;
  hashed: boolean;
}

/**
 * Password Value Object
 * - Password.createRaw() → valida força + armazena plaintext temporariamente
 * - Password.createHashed() → armazena hash bcrypt direto do banco
 * - Nunca expõe o valor via getter público sem contexto
 */
export class Password extends ValueObject<PasswordProps> {
  private static readonly MIN_LENGTH = 8;
  private static readonly MAX_LENGTH = 72; // bcrypt max

  private constructor(props: PasswordProps) {
    super(props);
  }

  /** Retorna o valor (hash ou plaintext) — uso interno apenas */
  getRawValue(): string {
    return this.props.value;
  }

  get isHashed(): boolean {
    return this.props.hashed;
  }

  static createRaw(password: string): Either<InvalidValueObjectError, Password> {
    if (!password || password.length < Password.MIN_LENGTH) {
      return left(
        new InvalidValueObjectError(
          'password',
          `must be at least ${Password.MIN_LENGTH} characters`,
        ),
      );
    }

    if (password.length > Password.MAX_LENGTH) {
      return left(
        new InvalidValueObjectError(
          'password',
          `must be at most ${Password.MAX_LENGTH} characters`,
        ),
      );
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecial) {
      return left(
        new InvalidValueObjectError(
          'password',
          'must contain uppercase, lowercase, number and special character',
        ),
      );
    }

    return right(new Password({ value: password, hashed: false }));
  }

  static createHashed(hash: string): Password {
    return new Password({ value: hash, hashed: true });
  }
}
