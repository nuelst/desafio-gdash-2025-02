import { Injectable } from '@nestjs/common';
import {
  CreateWeatherLogUseCase,
  ExportWeatherDataUseCase,
  GenerateAIInsightsUseCase,
  GetLatestWeatherLogUseCase,
  GetLocationsUseCase,
  GetWeatherForecastUseCase,
  GetWeatherInsightsUseCase,
  GetWeatherLogsUseCase
} from './application/use-cases';
import { AIInsightsResponse } from './application/use-cases/generate-ai-insights.use-case';
import { WeatherForecastResponse } from './application/use-cases/get-weather-forecast.use-case';
import { WeatherInsights } from './application/use-cases/get-weather-insights.use-case';
import { WeatherLogSnapshot } from './domain/entities/weather-log.entity';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';

@Injectable()
export class WeatherService {
  constructor(
    private readonly createWeatherLogUseCase: CreateWeatherLogUseCase,
    private readonly exportWeatherDataUseCase: ExportWeatherDataUseCase,
    private readonly generateAIInsightsUseCase: GenerateAIInsightsUseCase,
    private readonly getLatestWeatherLogUseCase: GetLatestWeatherLogUseCase,
    private readonly getLocationsUseCase: GetLocationsUseCase,
    private readonly getWeatherForecastUseCase: GetWeatherForecastUseCase,
    private readonly getWeatherInsightsUseCase: GetWeatherInsightsUseCase,
    private readonly getWeatherLogsUseCase: GetWeatherLogsUseCase,
  ) { }

  async create(createWeatherLogDto: CreateWeatherLogDto): Promise<WeatherLogSnapshot> {
    const weatherLog =
      await this.createWeatherLogUseCase.execute(createWeatherLogDto);
    return weatherLog.toSnapshot();
  }

  async findAll(
    page: number = 1,
    limit: number = 50,
    location?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{ data: WeatherLogSnapshot[]; total: number; page: number; limit: number }> {
    const result = await this.getWeatherLogsUseCase.execute({
      page,
      limit,
      location,
      startDate,
      endDate,
    });
    return {
      data: result.data.map((log) => log.toSnapshot()),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  async findLatest(location?: string): Promise<WeatherLogSnapshot | null> {
    const log = await this.getLatestWeatherLogUseCase.execute(location);
    return log ? log.toSnapshot() : null;
  }

  async getInsights(location?: string): Promise<AIInsightsResponse> {
    // Usa IA por padrão, com fallback automático para regras
    return this.generateAIInsightsUseCase.execute(location);
  }

  async getInsightsRuleBased(location?: string): Promise<WeatherInsights> {
    // Método alternativo: apenas regras (sem IA)
    return this.getWeatherInsightsUseCase.execute(location);
  }

  async exportToCSV(location?: string): Promise<string> {
    return this.exportWeatherDataUseCase.exportToCSV(location);
  }

  async exportToXLSX(location?: string): Promise<Buffer> {
    return this.exportWeatherDataUseCase.exportToXLSX(location);
  }

  async getLocations(): Promise<string[]> {
    return this.getLocationsUseCase.execute();
  }

  async getForecast(
    latitude: number,
    longitude: number,
    location: string,
    days: number = 10,
  ): Promise<WeatherForecastResponse> {
    return this.getWeatherForecastUseCase.execute(
      latitude,
      longitude,
      location,
      days,
    );
  }
}
