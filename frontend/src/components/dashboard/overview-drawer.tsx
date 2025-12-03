'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { formatDate, formatDateTime } from '@/core/utils';
import { formatCondition } from '@/core/utils/date-formatters';
import { useOverviewDrawer } from '@/hooks';
import { Calendar, ChevronRight, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface OverviewDrawerProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly latest?: {
    readonly temperature: number;
    readonly humidity: number;
    readonly windSpeed: number;
    readonly condition: string;
    readonly timestamp: string;
    readonly location: string;
    readonly latitude?: number;
    readonly longitude?: number;
    readonly precipitationProbability?: number;
  } | null;
  readonly location?: string;
}

export function OverviewDrawer({ open, onOpenChange, latest, location }: OverviewDrawerProps) {
  const {
    viewMode,
    setViewMode,
    viewModes,
    getDateLabel,
    yesterdayQuery,
    todayQuery,
    tomorrowForecastQuery,
    forecast10DaysQuery,
  } = useOverviewDrawer(open, latest, location);

  // Mobile: bottom, Desktop: right
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const drawerDirection = isMobile ? 'bottom' : 'right';

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction={drawerDirection}>
      <DrawerContent
        direction={drawerDirection}
        className={`bg-muted ${
          isMobile
            ? 'h-[85vh] max-h-[85vh] rounded-t-[10px]'
            : 'h-[100vh] max-h-[100vh] w-[90vw] sm:w-[500px]'
        }`}
      >
        {isMobile && <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />}
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Overview Climático
              </DrawerTitle>
              <DrawerDescription>{getDateLabel(viewMode)}</DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                {isMobile ? <X className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Seletor de modo de visualização */}
          <div className="grid grid-cols-2 gap-2">
            {viewModes.map((mode) => (
              <Button
                key={mode.value}
                variant={viewMode === mode.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode(mode.value)}
                className="w-full"
              >
                {mode.label}
              </Button>
            ))}
          </div>

          {/* Conteúdo baseado no modo selecionado */}
          {viewMode === 'today' && latest && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Condições Atuais</CardTitle>
                  <CardDescription>{latest.location}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Temperatura</p>
                      <p className="text-2xl font-bold">{latest.temperature.toFixed(1)}°C</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Umidade</p>
                      <p className="text-2xl font-bold">{latest.humidity.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Vento</p>
                      <p className="text-2xl font-bold">{latest.windSpeed.toFixed(1)} km/h</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Condição</p>
                      <Badge variant="outline" className="mt-1">
                        {formatCondition(latest.condition)}
                      </Badge>
                    </div>
                    {latest.precipitationProbability !== undefined &&
                      latest.precipitationProbability !== null && (
                        <div>
                          <p className="text-sm text-muted-foreground">Prob. Chuva</p>
                          <p className="text-2xl font-bold">
                            {latest.precipitationProbability.toFixed(0)}%
                          </p>
                        </div>
                      )}
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      Última atualização: {formatDateTime(latest.timestamp)}
                    </p>
                    {todayQuery.data && todayQuery.data.data.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Total de registros hoje: {todayQuery.data.total}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {viewMode === 'yesterday' && (
            <Card>
              <CardHeader>
                <CardTitle>Dados de Ontem</CardTitle>
                <CardDescription>Histórico do dia anterior</CardDescription>
              </CardHeader>
              <CardContent>
                {yesterdayQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : yesterdayQuery.error ? (
                  <p className="text-sm text-destructive">Erro ao carregar dados de ontem</p>
                ) : yesterdayQuery.data && yesterdayQuery.data.data.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total de Registros</p>
                        <p className="text-2xl font-bold">{yesterdayQuery.data.total}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Localização</p>
                        <p className="text-lg font-medium">
                          {yesterdayQuery.data.data[0]?.location || location || 'N/A'}
                        </p>
                      </div>
                    </div>
                    {yesterdayQuery.data.data.length > 0 &&
                      (() => {
                        const logs = yesterdayQuery.data.data;
                        const avgTemp = logs.reduce((sum, log) => sum + log.temperature, 0) / logs.length;
                        const avgHumidity =
                          logs.reduce((sum, log) => sum + log.humidity, 0) / logs.length;
                        const avgWind =
                          logs.reduce((sum, log) => sum + log.windSpeed, 0) / logs.length;
                        const latestLog = logs[0];

                        return (
                          <div className="pt-4 border-t space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Temperatura Média</p>
                                <p className="text-xl font-bold">{avgTemp.toFixed(1)}°C</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Umidade Média</p>
                                <p className="text-xl font-bold">{avgHumidity.toFixed(1)}%</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Vento Médio</p>
                                <p className="text-xl font-bold">{avgWind.toFixed(1)} km/h</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Última Condição</p>
                                <Badge variant="outline" className="mt-1">
                                  {formatCondition(latestLog.condition)}
                                </Badge>
                              </div>
                            </div>
                            <div className="pt-2">
                              <p className="text-xs text-muted-foreground">
                                Primeiro registro:{' '}
                                {formatDateTime(logs[logs.length - 1]?.timestamp || '')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Último registro: {formatDateTime(latestLog.timestamp)}
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum dado encontrado para ontem.</p>
                )}
              </CardContent>
            </Card>
          )}

          {viewMode === 'tomorrow' && (
            <Card>
              <CardHeader>
                <CardTitle>Previsão para Amanhã</CardTitle>
                <CardDescription>Condições climáticas previstas</CardDescription>
              </CardHeader>
              <CardContent>
                {tomorrowForecastQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : tomorrowForecastQuery.error ? (
                  <p className="text-sm text-destructive">
                    Erro ao carregar previsão.{' '}
                    {latest?.latitude && latest?.longitude ? '' : 'Coordenadas não disponíveis.'}
                  </p>
                ) : tomorrowForecastQuery.data &&
                  tomorrowForecastQuery.data.forecasts.length > 0 ? (
                  (() => {
                    const forecast = tomorrowForecastQuery.data.forecasts[0];
                    return (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Temperatura Máxima</p>
                            <p className="text-2xl font-bold">{forecast.temperatureMax.toFixed(1)}°C</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Temperatura Mínima</p>
                            <p className="text-2xl font-bold">{forecast.temperatureMin.toFixed(1)}°C</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Temperatura Média</p>
                            <p className="text-xl font-bold">{forecast.temperatureMean.toFixed(1)}°C</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Umidade</p>
                            <p className="text-xl font-bold">{forecast.humidity.toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Vento</p>
                            <p className="text-xl font-bold">{forecast.windSpeed.toFixed(1)} km/h</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Condição</p>
                            <Badge variant="outline" className="mt-1">
                              {formatCondition(forecast.condition)}
                            </Badge>
                          </div>
                        </div>
                        <div className="pt-4 border-t">
                          <p className="text-xs text-muted-foreground">
                            Localização: {tomorrowForecastQuery.data.location}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Data: {formatDate(forecast.date)}
                          </p>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma previsão disponível.</p>
                )}
              </CardContent>
            </Card>
          )}

          {viewMode === 'forecast' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Previsão para os Próximos 10 Dias</CardTitle>
                  <CardDescription>Condições climáticas previstas</CardDescription>
                </CardHeader>
                <CardContent>
                  {forecast10DaysQuery.isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : forecast10DaysQuery.error ? (
                    <p className="text-sm text-destructive">
                      Erro ao carregar previsão.{' '}
                      {latest?.latitude && latest?.longitude ? '' : 'Coordenadas não disponíveis.'}
                    </p>
                  ) : forecast10DaysQuery.data &&
                    forecast10DaysQuery.data.forecasts.length > 0 ? (
                    <div className="space-y-3">
                      {forecast10DaysQuery.data.forecasts.map((forecast) => {
                        const dateKey = formatDate(forecast.date);
                        return (
                          <div
                            key={forecast.date}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <p className="font-medium">{dateKey}</p>
                                <Badge variant="outline" className="text-xs">
                                  {formatCondition(forecast.condition)}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-muted-foreground">
                                <span>Max: {forecast.temperatureMax.toFixed(1)}°C</span>
                                <span>Min: {forecast.temperatureMin.toFixed(1)}°C</span>
                                <span className="hidden sm:inline">Média: {forecast.temperatureMean.toFixed(1)}°C</span>
                                <span>Umidade: {forecast.humidity.toFixed(0)}%</span>
                                <span>Vento: {forecast.windSpeed.toFixed(1)} km/h</span>
                              </div>
                            </div>
                            <Badge variant="secondary" className="ml-4">
                              {forecast.temperatureMean.toFixed(0)}°C
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhuma previsão disponível.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
