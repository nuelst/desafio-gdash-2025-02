import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { WeatherLog as WeatherLogEntity } from '../../domain/entities/weather-log.entity';
import { WeatherLog } from '../../schemas/weather-log.schema';
import { MongoWeatherLogRepository } from './mongo-weather-log.repository';

describe('MongoWeatherLogRepository', () => {
  let repository: MongoWeatherLogRepository;
  let model: any;
  let mockSave: jest.Mock;

  beforeEach(async () => {
    mockSave = jest.fn().mockResolvedValue(undefined);

    const mockDocument = {
      save: mockSave,
      toObject: jest.fn(() => ({
        id: 'test-id',
        timestamp: '2024-01-01T00:00:00Z',
        location: 'São Paulo',
        latitude: -23.5505,
        longitude: -46.6333,
        temperature: 25.5,
        humidity: 60,
        windSpeed: 10,
        condition: 'clear_sky',
        weatherCode: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    };

    const MockModel = jest.fn().mockImplementation(() => mockDocument) as any;

    MockModel.findOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
      sort: jest.fn().mockReturnThis(),
    });
    MockModel.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    });
    MockModel.updateOne = jest.fn().mockResolvedValue({});
    MockModel.deleteOne = jest.fn().mockResolvedValue({});
    MockModel.countDocuments = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(0),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MongoWeatherLogRepository,
        {
          provide: getModelToken(WeatherLog.name),
          useValue: MockModel,
        },
      ],
    }).compile();

    repository = module.get<MongoWeatherLogRepository>(
      MongoWeatherLogRepository,
    );
    model = module.get(getModelToken(WeatherLog.name));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should create a weather log', async () => {
    const entity = WeatherLogEntity.create({
      timestamp: '2024-01-01T00:00:00Z',
      location: 'São Paulo',
      latitude: -23.5505,
      longitude: -46.6333,
      temperature: 25.5,
      humidity: 60,
      windSpeed: 10,
      condition: 'clear_sky',
      weatherCode: 0,
    });

    await repository.create(entity);

    expect(model).toHaveBeenCalled();
    expect(mockSave).toHaveBeenCalled();
  });
});
