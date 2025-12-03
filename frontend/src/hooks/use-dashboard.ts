import { useMutation } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import * as React from 'react';
import { weatherApi } from '../core/api';
import { useLatestWeather, useWeatherInsights, useWeatherLocations, useWeatherLogs } from './use-weather';

export const useDashboard = () => {
  const [params, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
    location: parseAsString,
  });

  const latestQuery = useLatestWeather(params.location || undefined);
  const logsQuery = useWeatherLogs({
    page: params.page,
    limit: params.limit,
    location: params.location || undefined,
  });
  const chartLogsQuery = useWeatherLogs({
    page: 1,
    limit: 100,
    location: params.location || undefined,
  });
  const insightsQuery = useWeatherInsights(params.location || undefined);
  const locationsQuery = useWeatherLocations();

  const exportMutation = useMutation({
    mutationFn: async ({ format, location }: { format: 'csv' | 'xlsx'; location?: string }) => {
      const response =
        format === 'csv' ? await weatherApi.exportCSV(location) : await weatherApi.exportXLSX(location);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `weather-data.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
  });

  const exportData = React.useCallback(
    async (format: 'csv' | 'xlsx') => {
      try {
        await exportMutation.mutateAsync({
          format,
          location: params.location || undefined,
        });
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message || 'Erro ao exportar' };
      }
    },
    [exportMutation, params.location]
  );

  const uniqueLocations = React.useMemo(() => {
    const locations = locationsQuery.data || [];
    if (locations.length === 0 && !locationsQuery.isLoading && !locationsQuery.error) {
      return ['São Paulo, BR', 'Luanda, Angola'];
    }
    return locations;
  }, [locationsQuery.data, locationsQuery.isLoading, locationsQuery.error]);

  const tempStats = React.useMemo(() => {
    if (!logsQuery.data?.data || logsQuery.data.data.length === 0) {
      return { min: 0, max: 0 };
    }
    const temps = logsQuery.data.data.map((log) => log.temperature);
    return {
      min: Math.min(...temps),
      max: Math.max(...temps),
    };
  }, [logsQuery.data?.data]);

  const handleLocationChange = React.useCallback(
    (location: string) => {
      if (location === 'all' || !location) {
        setParams((prev) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { location: _, ...rest } = prev;
          return { ...rest, page: 1 };
        });
      } else {
        setParams({ location, page: 1 });
      }
    },
    [setParams]
  );

  return {
    latest: latestQuery.data || null,
    logs: logsQuery.data?.data || [],
    chartLogs: chartLogsQuery.data?.data || [],
    logsTotal: logsQuery.data?.total || 0,
    logsPage: logsQuery.data?.page || 1,
    logsLimit: logsQuery.data?.limit || params.limit || 10,
    insights: insightsQuery.data || null,
    loading: latestQuery.isLoading || logsQuery.isLoading || chartLogsQuery.isLoading || insightsQuery.isLoading || locationsQuery.isLoading,
    error: latestQuery.error || logsQuery.error || chartLogsQuery.error || insightsQuery.error || locationsQuery.error,
    params,
    setParams,
    uniqueLocations,
    tempStats,
    exportData,
    handleLocationChange,
    reload: () => {
      latestQuery.refetch();
      logsQuery.refetch();
      chartLogsQuery.refetch();
      insightsQuery.refetch();
      locationsQuery.refetch();
    },
  };
};

