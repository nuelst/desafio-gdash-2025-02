import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { CityWeather } from '../../domain/entities/city.entity';

@Injectable()
export class OpenMeteoClient {
  private readonly logger = new Logger(OpenMeteoClient.name);
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.open-meteo.com/v1',
      timeout: 10000,
    });
  }

  async getCurrentWeather(
    latitude: number,
    longitude: number,
  ): Promise<CityWeather> {
    try {
      const response = await this.client.get('/forecast', {
        params: {
          latitude,
          longitude,
          current:
            'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
          timezone: 'auto',
        },
      });

      const current = response.data.current;

      return {
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        condition: this.getWeatherCondition(current.weather_code),
        weatherCode: current.weather_code,
      };
    } catch (error: any) {
      this.logger.warn(
        `Erro ao buscar clima para ${latitude}, ${longitude}: ${error.message}`,
      );
      throw error;
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

