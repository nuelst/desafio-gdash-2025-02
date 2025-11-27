import { Test, TestingModule } from '@nestjs/testing';
import { WeatherLog } from '../../domain/entities/weather-log.entity';
import { IWeatherLogRepository } from '../../domain/repositories/weather-log.repository';
import { WEATHER_LOG_REPOSITORY_TOKEN } from '../../domain/repositories/weather-log.repository.token';
import { GetWeatherInsightsUseCase } from './get-weather-insights.use-case';

describe('GetWeatherInsightsUseCase', () => {
  let useCase: GetWeatherInsightsUseCase;
  let repository: jest.Mocked<IWeatherLogRepository>;

  beforeEach(async () => {
    const mockRepository: jest.Mocked<IWeatherLogRepository> = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findLatest: jest.fn(),
      findDistinctLocations: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetWeatherInsightsUseCase,
        {
          provide: WEATHER_LOG_REPOSITORY_TOKEN,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetWeatherInsightsUseCase>(GetWeatherInsightsUseCase);
    repository = module.get(WEATHER_LOG_REPOSITORY_TOKEN);
  });

  it('should generate insights from weather logs', async () => {
    const logs = [
      WeatherLog.create({
        timestamp: '2024-01-01T00:00:00Z',
        location: 'São Paulo',
        latitude: -23.5505,
        longitude: -46.6333,
        temperature: 25,
        humidity: 60,
        windSpeed: 10,
        condition: 'clear_sky',
        weatherCode: 0,
      }),
      WeatherLog.create({
        timestamp: '2024-01-01T01:00:00Z',
        location: 'São Paulo',
        latitude: -23.5505,
        longitude: -46.6333,
        temperature: 24,
        humidity: 65,
        windSpeed: 12,
        condition: 'clear_sky',
        weatherCode: 0,
      }),
    ];

    repository.findAll.mockResolvedValue({
      data: logs,
      total: 2,
    });

    const result = await useCase.execute();

    expect(result).toBeDefined();
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('averages');
    expect(result).toHaveProperty('trend');
    expect(result).toHaveProperty('comfortScore');
    expect(result).toHaveProperty('alerts');
    expect(result.dataPoints).toBe(2);
  });

  it('should return message when no data is available', async () => {
    repository.findAll.mockResolvedValue({
      data: [],
      total: 0,
    });

    const result = (await useCase.execute()) as any;

    expect(result).toHaveProperty('message');
    expect(result.message).toContain('Dados insuficientes');
  });

  it('should filter by location when provided', async () => {
    const logs = [
      WeatherLog.create({
        timestamp: '2024-01-01T00:00:00Z',
        location: 'São Paulo',
        latitude: -23.5505,
        longitude: -46.6333,
        temperature: 25,
        humidity: 60,
        windSpeed: 10,
        condition: 'clear_sky',
        weatherCode: 0,
      }),
    ];

    repository.findAll.mockResolvedValue({
      data: logs,
      total: 1,
    });

    await useCase.execute('São Paulo');

    expect(repository.findAll).toHaveBeenCalledWith({
      pagination: { page: 1, limit: 100 },
      filters: { location: 'São Paulo' },
    });
  });
});
