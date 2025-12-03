import { Test, TestingModule } from '@nestjs/testing';
import {
  CreateWeatherLogUseCase,
  ExportWeatherDataUseCase,
  GetLatestWeatherLogUseCase,
  GetLocationsUseCase,
  GetWeatherInsightsUseCase,
  GetWeatherLogsUseCase,
} from './application/use-cases';
import { WeatherLog } from './domain/entities/weather-log.entity';
import { WeatherService } from './weather.service';

describe('WeatherService', () => {
  let service: WeatherService;
  let createWeatherLogUseCase: jest.Mocked<CreateWeatherLogUseCase>;
  let getWeatherLogsUseCase: jest.Mocked<GetWeatherLogsUseCase>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let getLatestWeatherLogUseCase: jest.Mocked<GetLatestWeatherLogUseCase>;
  let getWeatherInsightsUseCase: jest.Mocked<GetWeatherInsightsUseCase>;
  let getLocationsUseCase: jest.Mocked<GetLocationsUseCase>;
  let exportWeatherDataUseCase: jest.Mocked<ExportWeatherDataUseCase>;

  beforeEach(async () => {
    const mockCreateWeatherLogUseCase = {
      execute: jest.fn(),
    };

    const mockGetWeatherLogsUseCase = {
      execute: jest.fn(),
    };

    const mockGetLatestWeatherLogUseCase = {
      execute: jest.fn(),
    };

    const mockGetWeatherInsightsUseCase = {
      execute: jest.fn(),
    };

    const mockGetLocationsUseCase = {
      execute: jest.fn(),
    };

    const mockExportWeatherDataUseCase = {
      exportToCSV: jest.fn(),
      exportToXLSX: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: CreateWeatherLogUseCase,
          useValue: mockCreateWeatherLogUseCase,
        },
        {
          provide: GetWeatherLogsUseCase,
          useValue: mockGetWeatherLogsUseCase,
        },
        {
          provide: GetLatestWeatherLogUseCase,
          useValue: mockGetLatestWeatherLogUseCase,
        },
        {
          provide: GetWeatherInsightsUseCase,
          useValue: mockGetWeatherInsightsUseCase,
        },
        {
          provide: GetLocationsUseCase,
          useValue: mockGetLocationsUseCase,
        },
        {
          provide: ExportWeatherDataUseCase,
          useValue: mockExportWeatherDataUseCase,
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    createWeatherLogUseCase = module.get(CreateWeatherLogUseCase);
    getWeatherLogsUseCase = module.get(GetWeatherLogsUseCase);
    getLatestWeatherLogUseCase = module.get(GetLatestWeatherLogUseCase);
    getWeatherInsightsUseCase = module.get(GetWeatherInsightsUseCase);
    getLocationsUseCase = module.get(GetLocationsUseCase);
    exportWeatherDataUseCase = module.get(ExportWeatherDataUseCase);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
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
        precipitationProbability: 0,
      };

      const weatherLog = WeatherLog.create(dto);
      createWeatherLogUseCase.execute.mockResolvedValue(weatherLog);

      const result = await service.create(dto);

      expect(result).toHaveProperty('location', 'São Paulo');
      expect(createWeatherLogUseCase.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return paginated weather logs', async () => {
      const weatherLog = WeatherLog.create({
        timestamp: '2024-01-01T00:00:00Z',
        location: 'São Paulo',
        latitude: -23.5505,
        longitude: -46.6333,
        temperature: 25.5,
        humidity: 60,
        windSpeed: 10,
        condition: 'clear_sky',
        weatherCode: 0,
        precipitationProbability: 0,
      });

      getWeatherLogsUseCase.execute.mockResolvedValue({
        data: [weatherLog],
        total: 1,
        page: 1,
        limit: 50,
      });

      const result = await service.findAll(1, 50, 'São Paulo');

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total', 1);
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('limit', 50);
    });
  });

  describe('getInsights', () => {
    it('should return weather insights', async () => {
      const insights = {
        summary: 'Test summary',
        averages: { temperature: 25, humidity: 60, windSpeed: 10 },
        trend: { temperature: 'estável', value: 0 },
        comfortScore: 80,
        condition: 'agradável',
        alerts: [],
        dataPoints: 10,
        latestUpdate: '2024-01-01T00:00:00Z',
      };

      getWeatherInsightsUseCase.execute.mockResolvedValue(insights);

      const result = await service.getInsights();

      expect(result).toEqual(insights);
      expect(getWeatherInsightsUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('exportToCSV', () => {
    it('should export data to CSV', async () => {
      exportWeatherDataUseCase.exportToCSV.mockResolvedValue('csv,data');

      const result = await service.exportToCSV();

      expect(result).toBe('csv,data');
      expect(exportWeatherDataUseCase.exportToCSV).toHaveBeenCalled();
    });
  });

  describe('exportToXLSX', () => {
    it('should export data to XLSX', async () => {
      const buffer = Buffer.from('xlsx data');
      exportWeatherDataUseCase.exportToXLSX.mockResolvedValue(buffer);

      const result = await service.exportToXLSX();

      expect(result).toBe(buffer);
      expect(exportWeatherDataUseCase.exportToXLSX).toHaveBeenCalled();
    });
  });

  describe('getLocations', () => {
    it('should return list of locations', async () => {
      getLocationsUseCase.execute.mockResolvedValue(['São Paulo', 'Luanda']);

      const result = await service.getLocations();

      expect(result).toEqual(['São Paulo', 'Luanda']);
    });
  });
});
