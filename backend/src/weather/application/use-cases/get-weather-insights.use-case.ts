import { Inject, Injectable } from '@nestjs/common';
import { WeatherLog } from '../../domain/entities/weather-log.entity';
import { IWeatherLogRepository } from '../../domain/repositories/weather-log.repository';
import { WEATHER_LOG_REPOSITORY_TOKEN } from '../../domain/repositories/weather-log.repository.token';

export interface WeatherInsights {
  summary: string;
  averages: {
    temperature: number;
    humidity: number;
    windSpeed: number;
  };
  trend: {
    temperature: string;
    value: number;
  };
  comfortScore: number;
  condition: string;
  alerts: string[];
  dataPoints: number;
  latestUpdate: string;
}

@Injectable()
export class GetWeatherInsightsUseCase {
  constructor(
    @Inject(WEATHER_LOG_REPOSITORY_TOKEN)
    private readonly weatherLogRepository: IWeatherLogRepository,
  ) { }

  async execute(location?: string): Promise<WeatherInsights> {
    const filters = location ? { location } : {};
    const result = await this.weatherLogRepository.findAll({
      pagination: { page: 1, limit: 100 },
      filters,
    });

    const logs = result.data;

    if (logs.length === 0) {
      return {
        message: 'Dados insuficientes para gerar insights',
        data: null,
      } as any;
    }

    const temperatures = logs.map((log) => log.temperature);
    const humidities = logs.map((log) => log.humidity);
    const windSpeeds = logs.map((log) => log.windSpeed);

    const avgTemp =
      temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
    const avgHumidity =
      humidities.reduce((a, b) => a + b, 0) / humidities.length;
    const avgWindSpeed =
      windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length;

    // Detectar tendência de temperatura
    const recentTemps = temperatures.slice(0, 10);
    const olderTemps = temperatures.slice(10, 20);
    const recentAvg =
      recentTemps.reduce((a, b) => a + b, 0) / recentTemps.length;
    const olderAvg =
      olderTemps.length > 0
        ? olderTemps.reduce((a, b) => a + b, 0) / olderTemps.length
        : recentAvg;

    const tempTrend =
      recentAvg > olderAvg
        ? 'subindo'
        : recentAvg < olderAvg
          ? 'caindo'
          : 'estável';

    // Calcular conforto climático (0-100)
    const comfortScore = this.calculateComfortScore(
      avgTemp,
      avgHumidity,
      avgWindSpeed,
    );

    // Classificar condição atual
    const latest = logs[0];
    const condition = this.classifyCondition(
      latest.temperature,
      latest.humidity,
      latest.condition,
    );

    // Gerar alertas
    const alerts = this.generateAlerts(logs);

    // Gerar resumo em texto
    const summary = this.generateSummary(
      logs,
      avgTemp,
      avgHumidity,
      tempTrend,
      condition,
    );

    return {
      summary,
      averages: {
        temperature: Math.round(avgTemp * 100) / 100,
        humidity: Math.round(avgHumidity * 100) / 100,
        windSpeed: Math.round(avgWindSpeed * 100) / 100,
      },
      trend: {
        temperature: tempTrend,
        value: Math.round((recentAvg - olderAvg) * 100) / 100,
      },
      comfortScore,
      condition,
      alerts,
      dataPoints: logs.length,
      latestUpdate: latest.timestamp,
    };
  }

  private calculateComfortScore(
    temp: number,
    humidity: number,
    windSpeed: number,
  ): number {
    let tempScore = 100;
    if (temp < 15 || temp > 30) tempScore -= 30;
    else if (temp < 18 || temp > 28) tempScore -= 15;

    let humidityScore = 100;
    if (humidity < 30 || humidity > 70) humidityScore -= 20;
    else if (humidity < 40 || humidity > 60) humidityScore -= 10;

    let windScore = 100;
    if (windSpeed > 25) windScore -= 20;
    else if (windSpeed > 20) windScore -= 10;

    return Math.round((tempScore + humidityScore + windScore) / 3);
  }

  private classifyCondition(
    temp: number,
    humidity: number,
    condition: string,
  ): string {
    if (temp < 15) return 'frio';
    if (temp > 30) return 'quente';
    if (condition.includes('rain') || condition.includes('drizzle'))
      return 'chuvoso';
    if (humidity > 70) return 'úmido';
    return 'agradável';
  }

  private generateAlerts(logs: WeatherLog[]): string[] {
    const alerts: string[] = [];
    const latest = logs[0];

    if (latest.temperature > 35) {
      alerts.push('Calor extremo - tome cuidado com exposição ao sol');
    }
    if (latest.temperature < 10) {
      alerts.push('Frio intenso - agasalhe-se adequadamente');
    }
    if (latest.humidity > 80) {
      alerts.push('Alta umidade - condições propícias para chuva');
    }
    if (latest.windSpeed > 25) {
      alerts.push('Vento forte - cuidado ao sair');
    }
    if (
      latest.condition.includes('rain') ||
      latest.condition.includes('thunderstorm')
    ) {
      alerts.push('Chuva prevista - leve guarda-chuva');
    }

    return alerts;
  }

  private generateSummary(
    logs: WeatherLog[],
    avgTemp: number,
    avgHumidity: number,
    tempTrend: string,
    condition: string,
  ): string {
    const days = Math.min(3, Math.floor(logs.length / 24));
    const latest = logs[0];

    return `Nos últimos ${days} dias, a temperatura média foi de ${Math.round(avgTemp)}°C, com umidade média de ${Math.round(avgHumidity)}%. A temperatura está ${tempTrend}. Condição atual: ${condition} (${latest.temperature}°C, ${latest.humidity}% umidade).`;
  }
}
