import { Id } from '../value-objects';

export abstract class DomainEvent {
  public readonly occurredOn: Date;
  public readonly aggregateId: Id;

  constructor(aggregateId: Id) {
    this.aggregateId = aggregateId;
    this.occurredOn = new Date();
  }
}
