import { Inject, Injectable } from '@nestjs/common';
import { WeatherLog } from '../../domain/entities/weather-log.entity';
import { IWeatherLogRepository } from '../../domain/repositories/weather-log.repository';
import { WEATHER_LOG_REPOSITORY_TOKEN } from '../../domain/repositories/weather-log.repository.token';

@Injectable()
export class GetLatestWeatherLogUseCase {
  constructor(
    @Inject(WEATHER_LOG_REPOSITORY_TOKEN)
    private readonly weatherLogRepository: IWeatherLogRepository,
  ) {}

  async execute(location?: string): Promise<WeatherLog | null> {
    return this.weatherLogRepository.findLatest(location);
  }
}
