import { BaseEntity, BaseSnapshot, Id } from '../../../shared/domain';
import { WeatherLogCreatedEvent } from '../events/weather-log-created.event';

export interface WeatherLogSnapshot extends BaseSnapshot {
  timestamp: string;
  location: string;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  weatherCode: number;
}

export class WeatherLog extends BaseEntity<
  WeatherLogSnapshot,
  WeatherLogCreatedEvent
> {
  private constructor(
    id: Id,
    private readonly _timestamp: string,
    private readonly _location: string,
    private readonly _latitude: number,
    private readonly _longitude: number,
    private readonly _temperature: number,
    private readonly _humidity: number,
    private readonly _windSpeed: number,
    private readonly _condition: string,
    private readonly _weatherCode: number,
    created_at?: Date,
    updated_at?: Date,
  ) {
    super(id, created_at, updated_at);
  }

  static create(props: {
    timestamp: string;
    location: string;
    latitude: number;
    longitude: number;
    temperature: number;
    humidity: number;
    windSpeed: number;
    condition: string;
    weatherCode: number;
  }): WeatherLog {
    const weatherLog = new WeatherLog(
      new Id(),
      props.timestamp,
      props.location,
      props.latitude,
      props.longitude,
      props.temperature,
      props.humidity,
      props.windSpeed,
      props.condition,
      props.weatherCode,
    );

    weatherLog.addDomainEvent(
      new WeatherLogCreatedEvent(
        weatherLog.id,
        props.location,
        props.temperature,
      ),
    );

    return weatherLog;
  }

  static rehydrate(snapshot: WeatherLogSnapshot): WeatherLog {
    return new WeatherLog(
      new Id(snapshot.id),
      snapshot.timestamp,
      snapshot.location,
      snapshot.latitude,
      snapshot.longitude,
      snapshot.temperature,
      snapshot.humidity,
      snapshot.windSpeed,
      snapshot.condition,
      snapshot.weatherCode,
      snapshot.created_at,
      snapshot.updated_at,
    );
  }

  toSnapshot(): WeatherLogSnapshot {
    return {
      id: this.id.value,
      timestamp: this._timestamp,
      location: this._location,
      latitude: this._latitude,
      longitude: this._longitude,
      temperature: this._temperature,
      humidity: this._humidity,
      windSpeed: this._windSpeed,
      condition: this._condition,
      weatherCode: this._weatherCode,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }

  get timestamp(): string {
    return this._timestamp;
  }

  get location(): string {
    return this._location;
  }

  get latitude(): number {
    return this._latitude;
  }

  get longitude(): number {
    return this._longitude;
  }

  get temperature(): number {
    return this._temperature;
  }

  get humidity(): number {
    return this._humidity;
  }

  get windSpeed(): number {
    return this._windSpeed;
  }

  get condition(): string {
    return this._condition;
  }

  get weatherCode(): number {
    return this._weatherCode;
  }
}
