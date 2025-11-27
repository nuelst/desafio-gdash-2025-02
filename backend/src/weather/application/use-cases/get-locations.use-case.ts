import { Inject, Injectable } from '@nestjs/common';
import { IWeatherLogRepository } from '../../domain/repositories/weather-log.repository';
import { WEATHER_LOG_REPOSITORY_TOKEN } from '../../domain/repositories/weather-log.repository.token';

@Injectable()
export class GetLocationsUseCase {
  constructor(
    @Inject(WEATHER_LOG_REPOSITORY_TOKEN)
    private readonly weatherLogRepository: IWeatherLogRepository,
  ) {}

  async execute(): Promise<string[]> {
    return this.weatherLogRepository.findDistinctLocations();
  }
}
