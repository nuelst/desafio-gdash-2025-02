import { useQuery } from '@tanstack/react-query';
import * as React from 'react';
import { weatherApi } from '../core/api';
import { formatDate } from '../core/utils';

export type ViewMode = 'today' | 'yesterday' | 'tomorrow' | 'forecast';

interface OverviewDrawerData {
  readonly temperature: number;
  readonly humidity: number;
  readonly windSpeed: number;
  readonly condition: string;
  readonly timestamp: string;
  readonly location: string;
  readonly latitude?: number;
  readonly longitude?: number;
  readonly precipitationProbability?: number;
}

export const useOverviewDrawer = (
  open: boolean,
  latest: OverviewDrawerData | null,
  location?: string
) => {
  const [viewMode, setViewMode] = React.useState<ViewMode>('today');

  const today = React.useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const todayEnd = React.useMemo(() => {
    const date = new Date(today);
    date.setHours(23, 59, 59, 999);
    return date;
  }, [today]);

  const yesterday = React.useMemo(() => {
    const date = new Date(today);
    date.setDate(date.getDate() - 1);
    return date;
  }, [today]);

  const yesterdayEnd = React.useMemo(() => {
    const date = new Date(yesterday);
    date.setHours(23, 59, 59, 999);
    return date;
  }, [yesterday]);

  const yesterdayQuery = useQuery({
    queryKey: ['weather-logs', 'yesterday', location, yesterday.toISOString(), yesterdayEnd.toISOString()],
    queryFn: () =>
      weatherApi
        .getLogs({
          page: 1,
          limit: 100,
          location: location || undefined,
          startDate: yesterday.toISOString(),
          endDate: yesterdayEnd.toISOString(),
        })
        .then((res) => res.data),
    enabled: viewMode === 'yesterday' && open,
  });

  const todayQuery = useQuery({
    queryKey: ['weather-logs', 'today', location, today.toISOString(), todayEnd.toISOString()],
    queryFn: () =>
      weatherApi
        .getLogs({
          page: 1,
          limit: 100,
          location: location || undefined,
          startDate: today.toISOString(),
          endDate: todayEnd.toISOString(),
        })
        .then((res) => res.data),
    enabled: viewMode === 'today' && open,
  });

  const tomorrowForecastQuery = useQuery({
    queryKey: ['weather-forecast', 'tomorrow', latest?.latitude, latest?.longitude, latest?.location],
    queryFn: () => {
      if (!latest?.latitude || !latest?.longitude || !latest?.location) {
        throw new Error('Coordenadas não disponíveis');
      }
      return weatherApi
        .getForecast({
          latitude: latest.latitude,
          longitude: latest.longitude,
          location: latest.location,
          days: 1,
        })
        .then((res) => res.data);
    },
    enabled: viewMode === 'tomorrow' && open && !!latest?.latitude && !!latest?.longitude,
  });

  const forecast10DaysQuery = useQuery({
    queryKey: ['weather-forecast', '10days', latest?.latitude, latest?.longitude, latest?.location],
    queryFn: () => {
      if (!latest?.latitude || !latest?.longitude || !latest?.location) {
        throw new Error('Coordenadas não disponíveis');
      }
      return weatherApi
        .getForecast({
          latitude: latest.latitude,
          longitude: latest.longitude,
          location: latest.location,
          days: 10,
        })
        .then((res) => res.data);
    },
    enabled: viewMode === 'forecast' && open && !!latest?.latitude && !!latest?.longitude,
  });

  const getDateLabel = React.useCallback(
    (mode: ViewMode) => {
      const todayDate = new Date();
      switch (mode) {
        case 'today': {
          return `Hoje - ${formatDate(todayDate)}`;
        }
        case 'yesterday': {
          const yesterdayDate = new Date(todayDate);
          yesterdayDate.setDate(yesterdayDate.getDate() - 1);
          return `Ontem - ${formatDate(yesterdayDate)}`;
        }
        case 'tomorrow': {
          const tomorrowDate = new Date(todayDate);
          tomorrowDate.setDate(tomorrowDate.getDate() + 1);
          return `Amanhã - ${formatDate(tomorrowDate)}`;
        }
        case 'forecast': {
          return 'Previsão - Próximos 10 dias';
        }
        default: {
          return '';
        }
      }
    },
    []
  );

  const viewModes: { value: ViewMode; label: string }[] = [
    { value: 'today', label: 'Hoje' },
    { value: 'yesterday', label: 'Ontem' },
    { value: 'tomorrow', label: 'Amanhã' },
    { value: 'forecast', label: 'Previsão 10 dias' },
  ];

  return {
    viewMode,
    setViewMode,
    viewModes,
    getDateLabel,
    yesterdayQuery,
    todayQuery,
    tomorrowForecastQuery,
    forecast10DaysQuery,
  };
};

