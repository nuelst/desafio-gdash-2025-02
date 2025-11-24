import { DomainEvent, Id } from '../../../shared/domain';

export class UserCreatedEvent extends DomainEvent {
  constructor(
    aggregateId: Id,
    public readonly email: string,
    public readonly name: string,
  ) {
    super(aggregateId);
  }
}
