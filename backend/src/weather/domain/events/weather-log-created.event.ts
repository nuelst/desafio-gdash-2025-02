import { DomainEvent, Id } from '../../../shared/domain';

export class WeatherLogCreatedEvent extends DomainEvent {
  constructor(
    aggregateId: Id,
    public readonly location: string,
    public readonly temperature: number,
  ) {
    super(aggregateId);
  }
}
