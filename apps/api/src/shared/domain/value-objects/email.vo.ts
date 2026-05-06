import { ValueObject } from './value-object';
import { Either, left, right } from '../errors/either';
import { InvalidValueObjectError } from '../errors/domain-errors';

interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(props: EmailProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  static create(email: string): Either<InvalidValueObjectError, Email> {
    const normalized = email.trim().toLowerCase();

    if (!normalized) {
      return left(new InvalidValueObjectError('email', 'cannot be empty'));
    }

    if (!Email.EMAIL_REGEX.test(normalized)) {
      return left(new InvalidValueObjectError('email', 'invalid format'));
    }

    if (normalized.length > 255) {
      return left(new InvalidValueObjectError('email', 'must be at most 255 characters'));
    }

    return right(new Email({ value: normalized }));
  }

  toString(): string {
    return this.props.value;
  }
}
