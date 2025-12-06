import { GoogleGenerativeAI } from '@google/generative-ai';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IWeatherLogRepository } from '../../domain/repositories/weather-log.repository';
import { WEATHER_LOG_REPOSITORY_TOKEN } from '../../domain/repositories/weather-log.repository.token';

export interface AIInsightsResponse {
  insights: string;
  generatedBy: 'ai' | 'rules';
  dataPoints: number;
  location?: string;
}

@Injectable()
export class GenerateAIInsightsUseCase {
  private readonly logger = new Logger(GenerateAIInsightsUseCase.name);
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor(
    @Inject(WEATHER_LOG_REPOSITORY_TOKEN)
    private readonly weatherLogRepository: IWeatherLogRepository,
    private readonly configService: ConfigService,
  ) {
    this.initializeAI();
  }

  private initializeAI() {
    const apiKey = this.configService.get<string>('gemini.apiKey');

    if (!apiKey || apiKey === 'your-gemini-api-key') {
      this.logger.warn(
        'Gemini API key não configurada. Insights de IA desabilitados.',
      );
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      this.logger.log('Gemini AI inicializado com sucesso');
    } catch (error) {
      this.logger.error('Erro ao inicializar Gemini AI:', error);
    }
  }

  async execute(location?: string): Promise<AIInsightsResponse> {
    // Buscar dados climáticos
    const filters = location ? { location } : {};
    const result = await this.weatherLogRepository.findAll({
      pagination: { page: 1, limit: 100 },
      filters,
    });

    const logs = result.data;

    if (logs.length === 0) {
      return {
        insights: 'Dados insuficientes para gerar insights.',
        generatedBy: 'rules',
        dataPoints: 0,
        location,
      };
    }

    // Calcular estatísticas
    const stats = this.calculateStats(logs);

    // Tentar gerar com IA
    if (this.model) {
      try {
        const aiInsights = await this.generateWithAI(stats);
        return {
          insights: aiInsights,
          generatedBy: 'ai',
          dataPoints: logs.length,
          location,
        };
      } catch (error) {
        this.logger.error('Erro ao gerar insights com IA:', error);
        this.logger.log('Usando fallback com regras...');
      }
    }

    // Fallback: usar sistema baseado em regras
    const ruleBasedInsights = this.generateWithRules(stats);
    return {
      insights: ruleBasedInsights,
      generatedBy: 'rules',
      dataPoints: logs.length,
      location,
    };
  }

  private calculateStats(logs: any[]): any {
    const temperatures = logs.map((log) => log.temperature);
    const humidities = logs.map((log) => log.humidity);
    const windSpeeds = logs.map((log) => log.windSpeed);

    const avgTemp =
      temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
    const avgHumidity =
      humidities.reduce((a, b) => a + b, 0) / humidities.length;
    const avgWindSpeed =
      windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length;

    // Detectar tendência
    const recentTemps = temperatures.slice(0, 10);
    const olderTemps = temperatures.slice(10, 20);
    const recentAvg =
      recentTemps.reduce((a, b) => a + b, 0) / recentTemps.length;
    const olderAvg =
      olderTemps.length > 0
        ? olderTemps.reduce((a, b) => a + b, 0) / olderTemps.length
        : recentAvg;

    const trend =
      recentAvg > olderAvg
        ? 'subindo'
        : recentAvg < olderAvg
          ? 'caindo'
          : 'estável';

    const latest = logs[0];
    const days = Math.min(3, Math.floor(logs.length / 24));

    return {
      avgTemp: Math.round(avgTemp * 10) / 10,
      avgHumidity: Math.round(avgHumidity * 10) / 10,
      avgWindSpeed: Math.round(avgWindSpeed * 10) / 10,
      trend,
      currentTemp: latest.temperature,
      currentHumidity: latest.humidity,
      currentWind: latest.windSpeed,
      condition: latest.condition,
      days,
      location: latest.location,
    };
  }

  private async generateWithAI(stats: any): Promise<string> {
    const prompt = `Você é um meteorologista experiente e amigável. Analise os dados climáticos abaixo e gere insights úteis e práticos em português do Brasil.

DADOS DOS ÚLTIMOS ${stats.days} DIAS em ${stats.location}:
- Temperatura média: ${stats.avgTemp}°C
- Umidade média: ${stats.avgHumidity}%
- Velocidade média do vento: ${stats.avgWindSpeed} km/h
- Tendência da temperatura: ${stats.trend}

CONDIÇÕES ATUAIS:
- Temperatura: ${stats.currentTemp}°C
- Umidade: ${stats.currentHumidity}%
- Vento: ${stats.currentWind} km/h
- Condição: ${stats.condition}

Por favor, gere:
1. Um resumo amigável e natural (não use bullet points)
2. Uma análise do conforto climático
3. Recomendações práticas para o dia

Seja conversacional, empático e direto. Máximo de 3-4 frases.`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  private generateWithRules(stats: any): string {
    // Sistema de fallback baseado em regras
    let text = `Nos últimos ${stats.days} dias em ${stats.location}, a temperatura média foi de ${stats.avgTemp}°C, com umidade média de ${stats.avgHumidity}%. `;

    text += `A temperatura está ${stats.trend}. `;

    // Análise de conforto
    if (stats.currentTemp >= 18 && stats.currentTemp <= 26) {
      text += `Condições muito agradáveis para atividades ao ar livre. `;
    } else if (stats.currentTemp > 30) {
      text += `Calor intenso - hidrate-se bem e evite exposição prolongada ao sol. `;
    } else if (stats.currentTemp < 15) {
      text += `Clima frio - agasalhe-se adequadamente. `;
    }

    // Recomendação baseada em vento
    if (stats.avgWindSpeed > 20) {
      text += `Ventos fortes, cuidado ao sair.`;
    }

    return text;
  }
}

