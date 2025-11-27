import { Inject, Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { IWeatherLogRepository } from '../../domain/repositories/weather-log.repository';
import { WEATHER_LOG_REPOSITORY_TOKEN } from '../../domain/repositories/weather-log.repository.token';

@Injectable()
export class ExportWeatherDataUseCase {
  constructor(
    @Inject(WEATHER_LOG_REPOSITORY_TOKEN)
    private readonly weatherLogRepository: IWeatherLogRepository,
  ) {}

  async exportToCSV(location?: string): Promise<string> {
    const filters = location ? { location } : {};
    const result = await this.weatherLogRepository.findAll({
      pagination: { page: 1, limit: 1000 },
      filters,
    });

    const logs = result.data;

    const headers =
      'Timestamp,Location,Latitude,Longitude,Temperature,Humidity,Wind Speed,Condition,Weather Code\n';
    const rows = logs.map(
      (log) =>
        `${log.timestamp},${log.location},${log.latitude},${log.longitude},${log.temperature},${log.humidity},${log.windSpeed},${log.condition},${log.weatherCode}`,
    );

    return headers + rows.join('\n');
  }

  async exportToXLSX(location?: string): Promise<Buffer> {
    const filters = location ? { location } : {};
    const result = await this.weatherLogRepository.findAll({
      pagination: { page: 1, limit: 1000 },
      filters,
    });

    const logs = result.data;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Weather Data');

    worksheet.columns = [
      { header: 'Timestamp', key: 'timestamp', width: 20 },
      { header: 'Location', key: 'location', width: 20 },
      { header: 'Latitude', key: 'latitude', width: 12 },
      { header: 'Longitude', key: 'longitude', width: 12 },
      { header: 'Temperature (°C)', key: 'temperature', width: 15 },
      { header: 'Humidity (%)', key: 'humidity', width: 12 },
      { header: 'Wind Speed (km/h)', key: 'windSpeed', width: 15 },
      { header: 'Condition', key: 'condition', width: 15 },
      { header: 'Weather Code', key: 'weatherCode', width: 12 },
    ];

    logs.forEach((log) => {
      worksheet.addRow({
        timestamp: log.timestamp,
        location: log.location,
        latitude: log.latitude,
        longitude: log.longitude,
        temperature: log.temperature,
        humidity: log.humidity,
        windSpeed: log.windSpeed,
        condition: log.condition,
        weatherCode: log.weatherCode,
      });
    });

    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
