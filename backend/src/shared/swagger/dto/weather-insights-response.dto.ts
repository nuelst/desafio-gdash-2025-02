import { ApiProperty } from '@nestjs/swagger';

export class WeatherInsightsResponseDto {
  @ApiProperty({
    description: 'Resumo textual dos insights gerados por IA',
    example:
      'Nos últimos 3 dias, a temperatura média foi de 25°C, com umidade média de 65%. A temperatura está subindo. Condição atual: agradável (25.5°C, 65% umidade).',
  })
  summary: string;

  @ApiProperty({
    description: 'Médias calculadas dos dados históricos',
    type: 'object',
    properties: {
      temperature: { type: 'number', example: 25.2 },
      humidity: { type: 'number', example: 65.5 },
      windSpeed: { type: 'number', example: 12.3 },
    },
  })
  averages: {
    temperature: number;
    humidity: number;
    windSpeed: number;
  };

  @ApiProperty({
    description: 'Tendência de temperatura',
    type: 'object',
    properties: {
      temperature: {
        type: 'string',
        enum: ['subindo', 'caindo', 'estável'],
        example: 'subindo',
      },
      value: { type: 'number', example: 1.5 },
    },
  })
  trend: {
    temperature: string;
    value: number;
  };

  @ApiProperty({
    description: 'Pontuação de conforto climático (0-100)',
    example: 85,
    minimum: 0,
    maximum: 100,
  })
  comfortScore: number;

  @ApiProperty({
    description: 'Classificação da condição atual',
    example: 'agradável',
    enum: ['frio', 'quente', 'agradável', 'chuvoso', 'úmido'],
  })
  condition: string;

  @ApiProperty({
    description: 'Lista de alertas gerados',
    type: [String],
    example: ['Calor extremo - tome cuidado com exposição ao sol'],
  })
  alerts: string[];

  @ApiProperty({
    description: 'Número de pontos de dados analisados',
    example: 100,
  })
  dataPoints: number;

  @ApiProperty({
    description: 'Timestamp da última atualização',
    example: '2024-01-15T10:30:00Z',
  })
  latestUpdate: string;
}
