import { ValueObject } from './value-object';
import { Either, left, right } from '../errors/either';
import { InvalidValueObjectError } from '../errors/domain-errors';

interface CnpjProps {
  value: string; // stored unmasked: "12345678000195"
}

/**
 * CNPJ Value Object — valida dígitos verificadores
 */
export class Cnpj extends ValueObject<CnpjProps> {
  private constructor(props: CnpjProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  get formatted(): string {
    const v = this.props.value;
    return `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5, 8)}/${v.slice(8, 12)}-${v.slice(12)}`;
  }

  static create(raw: string): Either<InvalidValueObjectError, Cnpj> {
    const digits = raw.replace(/\D/g, '');

    if (digits.length !== 14) {
      return left(new InvalidValueObjectError('CNPJ', 'must have 14 digits'));
    }

    if (/^(\d)\1+$/.test(digits)) {
      return left(new InvalidValueObjectError('CNPJ', 'cannot be all same digits'));
    }

    if (!Cnpj.validateCheckDigits(digits)) {
      return left(new InvalidValueObjectError('CNPJ', 'invalid check digits'));
    }

    return right(new Cnpj({ value: digits }));
  }

  private static validateCheckDigits(cnpj: string): boolean {
    const calcDigit = (str: string, weights: number[]): number => {
      const sum = str
        .split('')
        .reduce((acc, char, idx) => acc + parseInt(char, 10) * weights[idx]!, 0);
      const rem = sum % 11;
      return rem < 2 ? 0 : 11 - rem;
    };

    const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    const d1 = calcDigit(cnpj.slice(0, 12), w1);
    const d2 = calcDigit(cnpj.slice(0, 13), w2);

    return d1 === parseInt(cnpj[12]!, 10) && d2 === parseInt(cnpj[13]!, 10);
  }

  toString(): string {
    return this.formatted;
  }
}
