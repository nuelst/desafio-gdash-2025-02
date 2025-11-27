import { Inject, Injectable } from '@nestjs/common';
import { WeatherLog } from '../../domain/entities/weather-log.entity';
import { IWeatherLogRepository } from '../../domain/repositories/weather-log.repository';
import { WEATHER_LOG_REPOSITORY_TOKEN } from '../../domain/repositories/weather-log.repository.token';

export interface CreateWeatherLogDto {
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

@Injectable()
export class CreateWeatherLogUseCase {
  constructor(
    @Inject(WEATHER_LOG_REPOSITORY_TOKEN)
    private readonly weatherLogRepository: IWeatherLogRepository,
  ) {}

  async execute(dto: CreateWeatherLogDto): Promise<WeatherLog> {
    const weatherLog = WeatherLog.create(dto);
    await this.weatherLogRepository.create(weatherLog);
    return weatherLog;
  }
}
