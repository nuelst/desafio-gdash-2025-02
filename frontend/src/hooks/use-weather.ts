import { useQuery } from '@tanstack/react-query';
import { weatherApi } from '../core/api';

export const useWeatherLogs = (params?: { page?: number; limit?: number; location?: string }) => {
  return useQuery({
    queryKey: ['weather-logs', params],
    queryFn: () => weatherApi.getLogs(params).then((res) => res.data),
  });
};

export const useLatestWeather = (location?: string) => {
  return useQuery({
    queryKey: ['weather-latest', location],
    queryFn: () => weatherApi.getLatest(location).then((res) => res.data),
    staleTime: 1000 * 60, // 1 minuto
  });
};

export const useWeatherInsights = (location?: string) => {
  return useQuery({
    queryKey: ['weather-insights', location],
    queryFn: () => weatherApi.getInsights(location).then((res) => res.data),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

export const useWeatherLocations = () => {
  return useQuery({
    queryKey: ['weather-locations'],
    queryFn: () => weatherApi.getLocations().then((res) => res.data),
    staleTime: 1000 * 60 * 10, // 10 minutos - localizações não mudam com frequência
  });
};

