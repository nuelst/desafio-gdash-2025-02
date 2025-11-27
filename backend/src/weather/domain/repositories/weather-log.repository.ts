import { BaseRepository } from '../../../shared/domain';
import { WeatherLog } from '../entities/weather-log.entity';

export type WeatherLogFilters = {
  location?: string;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
};

export interface IWeatherLogRepository
  extends BaseRepository<WeatherLog, WeatherLogFilters> {
  findLatest(location?: string): Promise<WeatherLog | null>;
  findDistinctLocations(): Promise<string[]>;
}
