import { DomainEvent } from '../events';
import { Id } from '../value-objects';

export interface BaseSnapshot {
  id: string;
  created_at: Date;
  updated_at: Date;
}

export abstract class BaseEntity<
  TSnapshot extends BaseSnapshot = BaseSnapshot,
  TDomainEvent extends DomainEvent = DomainEvent,
> {
  protected readonly _id: Id;
  protected readonly _created_at: Date;
  protected _updated_at: Date;

  private _pending_domain_events: TDomainEvent[] = [];

  protected constructor(id?: Id, created_at?: Date, updated_at?: Date) {
    this._id = id ?? new Id();
    this._created_at = created_at ?? new Date();
    this._updated_at = updated_at ?? new Date();
  }

  protected addDomainEvent(event: TDomainEvent): void {
    this._pending_domain_events.push(Object.freeze(event) as TDomainEvent);
  }

  public pullDomainEvents(): TDomainEvent[] {
    const out = this._pending_domain_events;
    this._pending_domain_events = [];
    return out;
  }

  get id(): Id {
    return this._id;
  }

  get created_at(): Date {
    return this._created_at;
  }

  get updated_at(): Date {
    return this._updated_at;
  }

  protected touch(): void {
    this._updated_at = new Date();
  }

  public abstract toSnapshot(): TSnapshot;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static rehydrate(_snapshot: any): any {
    throw new Error('Method must be implemented by subclass');
  }
}
