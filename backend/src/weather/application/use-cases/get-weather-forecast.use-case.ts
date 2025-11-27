import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

export interface DailyForecast {
  date: string; // ISO date string
  temperatureMax: number;
  temperatureMin: number;
  temperatureMean: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  weatherCode: number;
}

export interface WeatherForecastResponse {
  location: string;
  latitude: number;
  longitude: number;
  forecasts: DailyForecast[];
}

@Injectable()
export class GetWeatherForecastUseCase {
  private readonly logger = new Logger(GetWeatherForecastUseCase.name);
  private readonly openMeteoClient: AxiosInstance;

  constructor() {
    this.openMeteoClient = axios.create({
      baseURL: 'https://api.open-meteo.com/v1',
      timeout: 10000,
    });
  }

  async execute(
    latitude: number,
    longitude: number,
    location: string,
    days: number = 10,
  ): Promise<WeatherForecastResponse> {
    try {
      // Buscar dados diários (temperatura e código do tempo)
      const dailyResponse = await this.openMeteoClient.get('/forecast', {
        params: {
          latitude,
          longitude,
          daily: 'temperature_2m_max,temperature_2m_min,weather_code',
          timezone: 'auto',
          forecast_days: Math.min(days, 16), // Open-Meteo permite até 16 dias
        },
      });

      // Buscar dados horários para umidade e vento (média do dia)
      const hourlyResponse = await this.openMeteoClient.get('/forecast', {
        params: {
          latitude,
          longitude,
          hourly: 'relative_humidity_2m,wind_speed_10m',
          timezone: 'auto',
          forecast_days: Math.min(days, 16),
        },
      });

      const daily = dailyResponse.data.daily;
      const hourly = hourlyResponse.data.hourly;
      const forecasts: DailyForecast[] = [];

      for (let i = 0; i < daily.time.length && i < days; i++) {
        const date = daily.time[i];
        const weatherCode = daily.weather_code[i];
        
        // Calcular média de umidade e vento do dia a partir dos dados horários
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        
        let humiditySum = 0;
        let windSpeedSum = 0;
        let count = 0;
        
        // Calcular médias dos dados horários do dia
        if (hourly && hourly.time && hourly.relative_humidity_2m && hourly.wind_speed_10m) {
          for (let j = 0; j < hourly.time.length; j++) {
            const hourTime = new Date(hourly.time[j]);
            if (hourTime >= dayStart && hourTime <= dayEnd) {
              humiditySum += hourly.relative_humidity_2m[j] || 0;
              windSpeedSum += hourly.wind_speed_10m[j] || 0;
              count++;
            }
          }
        }
        
        const avgHumidity = count > 0 ? humiditySum / count : 0;
        const avgWindSpeed = count > 0 ? windSpeedSum / count : 0;
        
        forecasts.push({
          date,
          temperatureMax: daily.temperature_2m_max[i],
          temperatureMin: daily.temperature_2m_min[i],
          temperatureMean: (daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2,
          humidity: avgHumidity,
          windSpeed: avgWindSpeed,
          condition: this.getWeatherCondition(weatherCode),
          weatherCode,
        });
      }

      return {
        location,
        latitude,
        longitude,
        forecasts,
      };
    } catch (error: any) {
      this.logger.error(
        `Erro ao buscar previsão para ${location}: ${error.message}`,
        error.stack,
      );
      throw new Error(`Erro ao buscar previsão climática: ${error.message}`);
    }
  }

  private getWeatherCondition(weatherCode: number): string {
    const codes: Record<number, string> = {
      0: 'clear_sky',
      1: 'mainly_clear',
      2: 'partly_cloudy',
      3: 'overcast',
      45: 'fog',
      48: 'depositing_rime_fog',
      51: 'light_drizzle',
      53: 'moderate_drizzle',
      55: 'dense_drizzle',
      56: 'light_freezing_drizzle',
      57: 'dense_freezing_drizzle',
      61: 'slight_rain',
      63: 'moderate_rain',
      65: 'heavy_rain',
      66: 'light_freezing_rain',
      67: 'heavy_freezing_rain',
      71: 'slight_snow',
      73: 'moderate_snow',
      75: 'heavy_snow',
      77: 'snow_grains',
      80: 'slight_rain_showers',
      81: 'moderate_rain_showers',
      82: 'violent_rain_showers',
      85: 'slight_snow_showers',
      86: 'heavy_snow_showers',
      95: 'thunderstorm',
      96: 'thunderstorm_with_slight_hail',
      99: 'thunderstorm_with_heavy_hail',
    };

    return codes[weatherCode] || 'unknown';
  }
}

