"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { weatherApi } from "@/core/api/weather"
import { formatDate, formatDateTime } from "@/core/utils"
import { formatCondition } from "@/core/utils/date-formatters"
import { useQuery } from "@tanstack/react-query"
import { Calendar, ChevronRight, Loader2 } from "lucide-react"
import * as React from "react"

interface OverviewDrawerProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly latest?: {
    readonly temperature: number
    readonly humidity: number
    readonly windSpeed: number
    readonly condition: string
    readonly timestamp: string
    readonly location: string
    readonly latitude?: number
    readonly longitude?: number
  } | null
  readonly location?: string
}

type ViewMode = 'today' | 'yesterday' | 'tomorrow' | 'forecast'

export function OverviewDrawer({ open, onOpenChange, latest, location }: OverviewDrawerProps) {
  const [viewMode, setViewMode] = React.useState<ViewMode>('today')

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayEnd = new Date(today)
  todayEnd.setHours(23, 59, 59, 999)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayEnd = new Date(yesterday)
  yesterdayEnd.setHours(23, 59, 59, 999)

  // Buscar dados de ontem
  const yesterdayQuery = useQuery({
    queryKey: ['weather-logs', 'yesterday', location, yesterday.toISOString(), yesterdayEnd.toISOString()],
    queryFn: () => weatherApi.getLogs({
      page: 1,
      limit: 100,
      location: location || undefined,
      startDate: yesterday.toISOString(),
      endDate: yesterdayEnd.toISOString(),
    }).then((res) => res.data),
    enabled: viewMode === 'yesterday' && open,
  })

  // Buscar dados de hoje (para comparação)
  const todayQuery = useQuery({
    queryKey: ['weather-logs', 'today', location, today.toISOString(), todayEnd.toISOString()],
    queryFn: () => weatherApi.getLogs({
      page: 1,
      limit: 100,
      location: location || undefined,
      startDate: today.toISOString(),
      endDate: todayEnd.toISOString(),
    }).then((res) => res.data),
    enabled: viewMode === 'today' && open,
  })

  // Buscar previsão para amanhã
  const tomorrowForecastQuery = useQuery({
    queryKey: ['weather-forecast', 'tomorrow', latest?.latitude, latest?.longitude, latest?.location],
    queryFn: () => {
      if (!latest?.latitude || !latest?.longitude || !latest?.location) {
        throw new Error('Coordenadas não disponíveis')
      }
      return weatherApi.getForecast({
        latitude: latest.latitude,
        longitude: latest.longitude,
        location: latest.location,
        days: 1,
      }).then((res) => res.data)
    },
    enabled: viewMode === 'tomorrow' && open && !!latest?.latitude && !!latest?.longitude,
  })

  // Buscar previsão para próximos 10 dias
  const forecast10DaysQuery = useQuery({
    queryKey: ['weather-forecast', '10days', latest?.latitude, latest?.longitude, latest?.location],
    queryFn: () => {
      if (!latest?.latitude || !latest?.longitude || !latest?.location) {
        throw new Error('Coordenadas não disponíveis')
      }
      return weatherApi.getForecast({
        latitude: latest.latitude,
        longitude: latest.longitude,
        location: latest.location,
        days: 10,
      }).then((res) => res.data)
    },
    enabled: viewMode === 'forecast' && open && !!latest?.latitude && !!latest?.longitude,
  })

  const getDateLabel = (mode: ViewMode) => {
    const today = new Date()
    switch (mode) {
      case 'today': {
        return `Hoje - ${formatDate(today)}`
      }
      case 'yesterday': {
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        return `Ontem - ${formatDate(yesterday)}`
      }
      case 'tomorrow': {
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        return `Amanhã - ${formatDate(tomorrow)}`
      }
      case 'forecast': {
        return 'Previsão - Próximos 10 dias'
      }
      default: {
        return ''
      }
    }
  }

  const viewModes: { value: ViewMode; label: string }[] = [
    { value: 'today', label: 'Hoje' },
    { value: 'yesterday', label: 'Ontem' },
    { value: 'tomorrow', label: 'Amanhã' },
    { value: 'forecast', label: 'Previsão 10 dias' },
  ]

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent direction="right" className="h-[100vh] max-h-[100vh] w-[90vw] sm:w-[500px] bg-muted">
        <div className="mx-auto mt-4 h-2 w-[100px]  bg-muted hidden" />
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Overview Climático
              </DrawerTitle>
              <DrawerDescription>
                {getDateLabel(viewMode)}
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Seletor de modo de visualização */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                  <p className="text-sm text-destructive">
                    Erro ao carregar dados de ontem
                  </p>
                ) : yesterdayQuery.data && yesterdayQuery.data.data.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total de Registros</p>
                        <p className="text-2xl font-bold">{yesterdayQuery.data.total}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Localização</p>
                        <p className="text-lg font-medium">{yesterdayQuery.data.data[0]?.location || location || 'N/A'}</p>
                      </div>
                    </div>
                    {yesterdayQuery.data.data.length > 0 && (() => {
                      const logs = yesterdayQuery.data.data
                      const avgTemp = logs.reduce((sum, log) => sum + log.temperature, 0) / logs.length
                      const avgHumidity = logs.reduce((sum, log) => sum + log.humidity, 0) / logs.length
                      const avgWind = logs.reduce((sum, log) => sum + log.windSpeed, 0) / logs.length
                      const latestLog = logs[0] // Mais recente

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
                              Primeiro registro: {formatDateTime(logs[logs.length - 1]?.timestamp || '')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Último registro: {formatDateTime(latestLog.timestamp)}
                            </p>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhum dado encontrado para ontem.
                  </p>
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
                    Erro ao carregar previsão. {latest?.latitude && latest?.longitude ? '' : 'Coordenadas não disponíveis.'}
                  </p>
                ) : tomorrowForecastQuery.data && tomorrowForecastQuery.data.forecasts.length > 0 ? (
                  (() => {
                    const forecast = tomorrowForecastQuery.data.forecasts[0]
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
                    )
                  })()
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma previsão disponível.
                  </p>
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
                      Erro ao carregar previsão. {latest?.latitude && latest?.longitude ? '' : 'Coordenadas não disponíveis.'}
                    </p>
                  ) : forecast10DaysQuery.data && forecast10DaysQuery.data.forecasts.length > 0 ? (
                    <div className="space-y-3">
                      {forecast10DaysQuery.data.forecasts.map((forecast) => {
                        const dateKey = formatDate(forecast.date)
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
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span>Max: {forecast.temperatureMax.toFixed(1)}°C</span>
                                <span>Min: {forecast.temperatureMin.toFixed(1)}°C</span>
                                <span>Média: {forecast.temperatureMean.toFixed(1)}°C</span>
                                <span>Umidade: {forecast.humidity.toFixed(0)}%</span>
                                <span>Vento: {forecast.windSpeed.toFixed(1)} km/h</span>
                              </div>
                            </div>
                            <Badge variant="secondary" className="ml-4">
                              {forecast.temperatureMean.toFixed(0)}°C
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma previsão disponível.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

