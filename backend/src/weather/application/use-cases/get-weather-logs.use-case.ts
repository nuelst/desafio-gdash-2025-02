import { Inject, Injectable } from '@nestjs/common';
import { WeatherLog } from '../../domain/entities/weather-log.entity';
import {
  IWeatherLogRepository,
  WeatherLogFilters,
} from '../../domain/repositories/weather-log.repository';
import { WEATHER_LOG_REPOSITORY_TOKEN } from '../../domain/repositories/weather-log.repository.token';

@Injectable()
export class GetWeatherLogsUseCase {
  constructor(
    @Inject(WEATHER_LOG_REPOSITORY_TOKEN)
    private readonly weatherLogRepository: IWeatherLogRepository,
  ) { }

  async execute(params?: {
    page?: number;
    limit?: number;
    location?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    data: WeatherLog[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = params?.page || 1;
    const limit = params?.limit || 50;

    const filters: WeatherLogFilters = {};
    if (params?.location) {
      filters.location = params.location;
    }
    if (params?.startDate) {
      filters.startDate = params.startDate;
    }
    if (params?.endDate) {
      filters.endDate = params.endDate;
    }

    const result = await this.weatherLogRepository.findAll({
      pagination: { page, limit },
      filters,
    });

    return {
      ...result,
      page,
      limit,
    };
  }
}
