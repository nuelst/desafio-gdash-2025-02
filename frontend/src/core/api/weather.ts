import type { Insights, WeatherLog } from '../validation';
import { apiClient } from './client';

export interface WeatherLogsResponse {
  data: WeatherLog[];
  total: number;
  page: number;
  limit: number;
}

export type { Insights, WeatherLog };

export const weatherApi = {
  getLogs: (params?: { page?: number; limit?: number; location?: string | null; startDate?: string; endDate?: string }) => {
    // Remover location se for null ou undefined
    const cleanParams = { ...params }
    if (cleanParams.location === null || cleanParams.location === undefined || cleanParams.location === '') {
      delete cleanParams.location
    }
    return apiClient.get<WeatherLogsResponse>('/weather/logs', { params: cleanParams })
  },

  getLatest: (location?: string | null) => {
    const params = location ? { location } : {}
    return apiClient.get<WeatherLog>('/weather/latest', { params })
  },

  getInsights: (location?: string | null) => {
    const params = location ? { location } : {}
    return apiClient.get<Insights>('/weather/insights', { params })
  },

  exportCSV: (location?: string) =>
    apiClient.get('/weather/export.csv', {
      params: { location },
      responseType: 'blob',
    }),

  exportXLSX: (location?: string) =>
    apiClient.get('/weather/export.xlsx', {
      params: { location },
      responseType: 'blob',
    }),

  getLocations: () => apiClient.get<string[]>('/weather/locations'),

  getForecast: (params: {
    latitude: number
    longitude: number
    location: string
    days?: number
  }) => {
    return apiClient.get<{
      location: string
      latitude: number
      longitude: number
      forecasts: Array<{
        date: string
        temperatureMax: number
        temperatureMin: number
        temperatureMean: number
        humidity: number
        windSpeed: number
        condition: string
        weatherCode: number
      }>
    }>('/weather/forecast', {
      params: {
        latitude: params.latitude,
        longitude: params.longitude,
        location: params.location,
        days: params.days || 10,
      },
    })
  },
};

