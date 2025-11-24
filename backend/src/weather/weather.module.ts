import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CreateWeatherLogUseCase,
  ExportWeatherDataUseCase,
  GetLatestWeatherLogUseCase,
  GetLocationsUseCase,
  GetWeatherForecastUseCase,
  GetWeatherInsightsUseCase,
  GetWeatherLogsUseCase,
} from './application/use-cases';
import { WEATHER_LOG_REPOSITORY_TOKEN } from './domain/repositories/weather-log.repository.token';
import { MongoWeatherLogRepository } from './infrastructure/persistence/mongo-weather-log.repository';
import { WeatherLog, WeatherLogSchema } from './schemas/weather-log.schema';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WeatherLog.name, schema: WeatherLogSchema },
    ]),
  ],
  controllers: [WeatherController],
  providers: [
    WeatherService,
    {
      provide: WEATHER_LOG_REPOSITORY_TOKEN,
      useClass: MongoWeatherLogRepository,
    },
    CreateWeatherLogUseCase,
    GetWeatherLogsUseCase,
    GetLatestWeatherLogUseCase,
    GetLocationsUseCase,
    GetWeatherInsightsUseCase,
    GetWeatherForecastUseCase,
    ExportWeatherDataUseCase,
  ],
  exports: [WeatherService, WEATHER_LOG_REPOSITORY_TOKEN],
})
export class WeatherModule { }
