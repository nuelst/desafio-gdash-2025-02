import { ApiProperty } from '@nestjs/swagger';

export class WeatherLogResponseDto {
  @ApiProperty({
    description: 'ID único do registro',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  _id: string;

  @ApiProperty({
    description: 'Timestamp do registro',
    example: '2024-01-15T10:30:00Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Nome da localização',
    example: 'São Paulo, BR',
  })
  location: string;

  @ApiProperty({
    description: 'Latitude',
    example: -23.55052,
  })
  latitude: number;

  @ApiProperty({
    description: 'Longitude',
    example: -46.6333,
  })
  longitude: number;

  @ApiProperty({
    description: 'Temperatura em graus Celsius',
    example: 25.5,
  })
  temperature: number;

  @ApiProperty({
    description: 'Umidade relativa em percentual',
    example: 65.0,
  })
  humidity: number;

  @ApiProperty({
    description: 'Velocidade do vento em km/h',
    example: 12.5,
  })
  windSpeed: number;

  @ApiProperty({
    description: 'Condição climática',
    example: 'clear_sky',
  })
  condition: string;

  @ApiProperty({
    description: 'Código do tempo',
    example: 0,
  })
  weatherCode: number;

  @ApiProperty({
    description: 'Data de criação',
    example: '2024-01-15T10:30:00.000Z',
  })
  created_at?: string;

  @ApiProperty({
    description: 'Data de atualização',
    example: '2024-01-15T10:30:00.000Z',
  })
  updated_at?: string;
}
