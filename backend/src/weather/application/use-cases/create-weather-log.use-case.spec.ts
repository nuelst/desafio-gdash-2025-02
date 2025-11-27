import { Test, TestingModule } from '@nestjs/testing';
import { WeatherLog } from '../../domain/entities/weather-log.entity';
import { IWeatherLogRepository } from '../../domain/repositories/weather-log.repository';
import { WEATHER_LOG_REPOSITORY_TOKEN } from '../../domain/repositories/weather-log.repository.token';
import { CreateWeatherLogUseCase } from './create-weather-log.use-case';

describe('CreateWeatherLogUseCase', () => {
  let useCase: CreateWeatherLogUseCase;
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
        CreateWeatherLogUseCase,
        {
          provide: WEATHER_LOG_REPOSITORY_TOKEN,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateWeatherLogUseCase>(CreateWeatherLogUseCase);
    repository = module.get(WEATHER_LOG_REPOSITORY_TOKEN);
  });

  it('should create a weather log', async () => {
    const dto = {
      timestamp: '2024-01-01T00:00:00Z',
      location: 'São Paulo',
      latitude: -23.5505,
      longitude: -46.6333,
      temperature: 25.5,
      humidity: 60,
      windSpeed: 10,
      condition: 'clear_sky',
      weatherCode: 0,
    };

    const result = await useCase.execute(dto);

    expect(result).toBeInstanceOf(WeatherLog);
    expect(repository.create).toHaveBeenCalledWith(expect.any(WeatherLog));
  });
});
