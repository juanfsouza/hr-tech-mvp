import { randomUUID } from 'node:crypto';

export class UniqueEntityID {
  private readonly _value: string;

  constructor(value?: string) {
    this._value = value ?? randomUUID();
  }

  get value(): string {
    return this._value;
  }

  equals(other: UniqueEntityID): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  static create(value?: string): UniqueEntityID {
    return new UniqueEntityID(value);
  }
}
