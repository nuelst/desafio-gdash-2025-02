import { randomUUID } from 'crypto';

export class Id {
  private readonly _value: string;

  constructor(value?: string) {
    if (value && !this.isValid(value)) {
      throw new Error('Invalid ID format');
    }
    this._value = value || randomUUID();
  }

  private isValid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    );
  }

  get value(): string {
    return this._value;
  }

  equals(other: Id): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
