import { format } from 'date-fns';

export interface ChartDataPoint extends Record<string, unknown> {
  time: string;
  temperatura: number;
  umidade: number;
  vento: number;
  chuva?: number;
}

export interface WeatherLog {
  timestamp: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitationProbability?: number;
}

export function groupDataByHour(logs: WeatherLog[]): ChartDataPoint[] {
  if (logs.length === 0) return [];

  const groupedByHour = new Map<string, { logs: WeatherLog[]; timestamp: number }>();

  for (const log of logs) {
    const date = new Date(log.timestamp);
    const hourKey = format(date, 'yyyy-MM-dd HH:00');
    const timestamp = date.getTime();

    if (!groupedByHour.has(hourKey)) {
      groupedByHour.set(hourKey, { logs: [], timestamp });
    }
    groupedByHour.get(hourKey)!.logs.push(log);
  }

  const groupedData: ChartDataPoint[] = Array.from(groupedByHour.entries())
    .map(([, { logs: hourLogs, timestamp }]) => {
      const avgTemp = hourLogs.reduce((sum, log) => sum + log.temperature, 0) / hourLogs.length;
      const avgHumidity = hourLogs.reduce((sum, log) => sum + log.humidity, 0) / hourLogs.length;
      const avgWind = hourLogs.reduce((sum, log) => sum + log.windSpeed, 0) / hourLogs.length;

      const date = new Date(timestamp);
      const timeLabel = format(date, 'HH:mm');

      const avgPrecipitation = hourLogs
        .filter((log) => log.precipitationProbability !== undefined && log.precipitationProbability !== null)
        .reduce((sum, log) => sum + (log.precipitationProbability || 0), 0) /
        hourLogs.filter((log) => log.precipitationProbability !== undefined && log.precipitationProbability !== null).length;

      return {
        time: timeLabel,
        temperatura: Number(avgTemp.toFixed(1)),
        umidade: Number(avgHumidity.toFixed(1)),
        vento: Number(avgWind.toFixed(1)),
        chuva: avgPrecipitation > 0 ? Number(avgPrecipitation.toFixed(1)) : undefined,
        _timestamp: timestamp, // Para ordenação
      } as ChartDataPoint & { _timestamp: number };
    })
    .sort((a, b) => (a as ChartDataPoint & { _timestamp: number })._timestamp - (b as ChartDataPoint & { _timestamp: number })._timestamp)
    .map(({ _timestamp, ...rest }) => rest); // Remover _timestamp do resultado final

  return groupedData;
}

export function getLast24HoursData(logs: WeatherLog[]): ChartDataPoint[] {
  if (logs.length === 0) return [];

  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const last24HoursLogs = logs.filter((log) => {
    const logDate = new Date(log.timestamp);
    return logDate >= last24Hours && logDate <= now;
  });

  return groupDataByHour(last24HoursLogs);
}

