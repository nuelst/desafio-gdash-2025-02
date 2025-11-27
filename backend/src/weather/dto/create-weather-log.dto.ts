import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateWeatherLogDto {
  @ApiProperty({
    description: 'Timestamp do registro em formato ISO 8601',
    example: '2024-01-15T10:30:00Z',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  timestamp: string;

  @ApiProperty({
    description: 'Nome da localização',
    example: 'São Paulo, BR',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    description: 'Latitude da localização',
    example: -23.55052,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({
    description: 'Longitude da localização',
    example: -46.6333,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({
    description: 'Temperatura em graus Celsius',
    example: 25.5,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  temperature: number;

  @ApiProperty({
    description: 'Umidade relativa em percentual',
    example: 65.0,
    type: Number,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @IsNotEmpty()
  humidity: number;

  @ApiProperty({
    description: 'Velocidade do vento em km/h',
    example: 12.5,
    type: Number,
    minimum: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  windSpeed: number;

  @ApiProperty({
    description: 'Condição climática (clear_sky, partly_cloudy, rain, etc.)',
    example: 'clear_sky',
    type: String,
    enum: [
      'clear_sky',
      'mainly_clear',
      'partly_cloudy',
      'overcast',
      'foggy',
      'light_rain',
      'moderate_rain',
      'heavy_rain',
      'thunderstorm',
    ],
  })
  @IsString()
  @IsNotEmpty()
  condition: string;

  @ApiProperty({
    description: 'Código do tempo conforme WMO Weather Interpretation Codes',
    example: 0,
    type: Number,
    minimum: 0,
    maximum: 99,
  })
  @IsNumber()
  @IsNotEmpty()
  weatherCode: number;
}
