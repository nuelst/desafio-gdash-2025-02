import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Bot,
  Calendar,
  Cloud,
  Droplets,
  FileDown,
  MapPin,
  Minus,
  Thermometer,
  Wind,
} from 'lucide-react';
import * as React from 'react';
import { AreaChartLegend } from '../../components/charts/area-chart-legend';
import { BarChartActive } from '../../components/charts/bar-chart-active';
import { PrecipitationChart } from '../../components/charts/precipitation-chart';
import { RadialChartHumidity } from '../../components/charts/radial-chart-humidity';
import { OverviewDrawer } from '../../components/dashboard/overview-drawer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { WeatherLogsDataTable } from '../../components/weather/weather-logs-data-table';
import { formatCondition } from '../../core/utils';
import { groupDataByHour } from '../../core/utils/chart-helpers';
import { useDashboard } from '../../hooks';

export default function DashboardView() {
  const {
    latest,
    logs,
    chartLogs,
    logsTotal,
    logsPage,
    logsLimit,
    insights,
    loading,
    error,
    exportData,
    params,
    setParams,
    uniqueLocations,
    tempStats,
    handleLocationChange,
  } = useDashboard();

  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const chartData = React.useMemo(() => {
    const logsForChart = chartLogs.length > 0 ? chartLogs : logs;
    return groupDataByHour(logsForChart);
  }, [chartLogs, logs]);

  const temperatureConfig = React.useMemo(
    () => ({
      temperatura: {
        label: 'Temperatura',
        color: '#ef4444',
      },
    }),
    []
  );

  const windConfig = React.useMemo(
    () => ({
      vento: {
        label: 'Vento',
        color: '#10b981',
      },
    }),
    []
  );

  const precipitationConfig = React.useMemo(
    () => ({
      chuva: {
        label: 'Probabilidade de Chuva',
        color: '#3b82f6',
      },
    }),
    []
  );

  const getTrendIcon = React.useCallback((trend: string) => {
    switch (trend) {
      case 'subindo':
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'caindo':
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  }, []);

  const handleExport = React.useCallback(
    async (format: 'csv' | 'xlsx') => {
      const result = await exportData(format);
      if (!result.success && result.error) {
        alert(result.error);
      }
    },
    [exportData]
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Erro: {(error as any)?.message || 'Erro ao carregar dados'}</p>
      </div>
    );
  }

  if (!latest) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Nenhum dado climático disponível ainda.</p>
        <p className="text-sm text-gray-400 mt-2">
          Aguarde alguns minutos para o coletor Python buscar os primeiros dados.
        </p>
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-4 lg:px-6 xl:px-8">
      {/* Header com filtro de localização */}
      <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard de Clima</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Monitoramento em tempo real das condições climáticas
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setDrawerOpen(true)} className="flex-1 sm:flex-initial">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Overview</span>
            <span className="sm:hidden">Ver</span>
          </Button>
          {uniqueLocations.length > 0 && (
            <Select value={params.location || 'all'} onValueChange={handleLocationChange}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Todas as localizações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as localizações</SelectItem>
                {uniqueLocations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1 sm:flex-initial">
                <FileDown className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                <FileDown className="mr-2 h-4 w-4" />
                Exportar como CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                <FileDown className="mr-2 h-4 w-4" />
                Exportar como XLSX
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {insights && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-1 sm:flex-initial">
                  <Bot className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Insights</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[90vw] sm:w-[500px] max-h-[80vh] overflow-y-auto p-0">
                <Card className="border-0 shadow-none m-0">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">Insights de IA</CardTitle>
                        <CardDescription>
                          Análise inteligente dos dados climáticos ({insights.dataPoints} pontos de dados)
                          {'insights' in insights && insights.generatedBy && (
                            <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                              insights.generatedBy === 'ai' 
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                            }`}>
                              {insights.generatedBy === 'ai' ? '🤖 IA (Gemini)' : '📊 Regras'}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="summary">
                        <AccordionTrigger>Resumo da Análise</AccordionTrigger>
                        <AccordionContent>
                          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                            {'insights' in insights ? (
                              <p className="text-sm text-blue-900 dark:text-blue-100 whitespace-pre-line">
                                {insights.insights}
                              </p>
                            ) : (
                              <p className="text-sm text-blue-900 dark:text-blue-100">{insights.summary}</p>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {'trend' in insights && (
                        <AccordionItem value="trends">
                          <AccordionTrigger>Tendências e Condições</AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-1 gap-3 pt-2">
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardDescription>Tendência de Temperatura</CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <div className="flex items-center gap-2">
                                    {getTrendIcon(insights.trend.temperature)}
                                    <div>
                                      <div className="text-base font-semibold capitalize">
                                        {insights.trend.temperature}
                                      </div>
                                      {insights.trend.value !== 0 && (
                                        <p className="text-xs text-muted-foreground">
                                          {insights.trend.value > 0 ? '+' : ''}
                                          {insights.trend.value.toFixed(1)}°C
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardDescription>Condição Geral</CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <div className="text-base font-semibold capitalize">{insights.condition}</div>
                                </CardContent>
                              </Card>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )}

                      {'alerts' in insights && insights.alerts && insights.alerts.length > 0 && (
                        <AccordionItem value="alerts">
                          <AccordionTrigger>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                              <span>Alertas ({insights.alerts.length})</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="bg-yellow-50 dark:bg-yellow-950 border-l-4 border-yellow-400 p-4 rounded">
                              <div className="flex">
                                <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                    Alertas:
                                  </p>
                                  <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside">
                                    {insights.alerts.map((alert) => (
                                      <li key={alert}>{alert}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )}
                    </Accordion>
                  </CardContent>
                </Card>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Cards principais - Valores atuais */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-4 sm:mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temperatura</CardTitle>
            <Thermometer className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{latest.temperature.toFixed(1)}°C</div>
            <p className="text-xs text-muted-foreground mt-1">
              {tempStats.min > 0 && tempStats.max > 0 && (
                <span className="hidden sm:inline">
                  Min: {tempStats.min.toFixed(1)}°C • Max: {tempStats.max.toFixed(1)}°C
                </span>
              )}
              {tempStats.min > 0 && tempStats.max > 0 && (
                <span className="sm:hidden">
                  {tempStats.min.toFixed(0)}-{tempStats.max.toFixed(0)}°C
                </span>
              )}
              {(!tempStats.min || !tempStats.max) && 'Temperatura atual'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Umidade</CardTitle>
            <Droplets className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{latest.humidity.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Umidade relativa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vento</CardTitle>
            <Wind className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{latest.windSpeed.toFixed(1)} km/h</div>
            <p className="text-xs text-muted-foreground mt-1">Velocidade do vento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Condição</CardTitle>
            <Cloud className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold capitalize">{formatCondition(latest.condition)}</div>
            <p className="text-xs text-muted-foreground mt-1">Condição climática</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prob. Chuva</CardTitle>
            <Droplets className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {latest.precipitationProbability !== undefined && latest.precipitationProbability !== null
                ? `${latest.precipitationProbability.toFixed(0)}%`
                : '-'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Probabilidade de precipitação</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Lado esquerdo: Temperatura ao Longo do Tempo (2/3 da largura) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Temperatura ao Longo do Tempo</CardTitle>
            <CardDescription>Variação da temperatura nas últimas medições</CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChartLegend data={chartData} config={temperatureConfig} height={250} className="h-[250px] sm:h-[300px]" />
          </CardContent>
        </Card>

        {/* Lado direito: Três gráficos empilhados (1/3 da largura) */}
        <div className="flex flex-col gap-6">
          {/* Umidade */}
          <Card>
            <CardHeader>
              <CardTitle>Umidade</CardTitle>
              <CardDescription>Nível de umidade atual</CardDescription>
            </CardHeader>
            <CardContent>
              <RadialChartHumidity humidity={latest.humidity} height={180} className="h-[180px] sm:h-[200px]" />
            </CardContent>
          </Card>

          {/* Velocidade do Vento */}
          <Card>
            <CardHeader>
              <CardTitle>Velocidade do Vento</CardTitle>
              <CardDescription>Variação da velocidade do vento nas últimas medições</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChartActive data={chartData} config={windConfig} height={180} className="h-[180px] sm:h-[200px]" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Gráfico de Probabilidade de Chuva */}
      {chartData.some((d) => d.chuva !== undefined) && (
        <Card className="mb-4 sm:mb-6">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Probabilidade de Chuva ao Longo do Tempo</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Variação da probabilidade de precipitação nas últimas medições</CardDescription>
          </CardHeader>
          <CardContent>
            <PrecipitationChart data={chartData} config={precipitationConfig} height={250} className="h-[250px] sm:h-[300px]" />
          </CardContent>
        </Card>
      )}

      {/* Tabela de registros */}
      <Card>
        <CardHeader>
          <CardTitle>Registros Recentes</CardTitle>
          <CardDescription>Histórico completo de medições climáticas</CardDescription>
        </CardHeader>
        <CardContent>
          <WeatherLogsDataTable
            data={logs}
            total={logsTotal}
            page={logsPage}
            limit={logsLimit}
            onPageChange={(page) => setParams({ page })}
            onPageSizeChange={(pageSize) => setParams({ ...params, page: 1, limit: pageSize })}
            onLocationFilterChange={(location) => {
              const trimmedLocation = location?.trim();
              if (trimmedLocation) {
                setParams({ location: trimmedLocation, page: 1 });
              } else {
                setParams((prev) => {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const { location: _, ...rest } = prev;
                  return { ...rest, page: 1 };
                });
              }
            }}
            locationFilter={params.location || ''}
          />
        </CardContent>
      </Card>

      {/* Drawer de Overview */}
      <OverviewDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        latest={
          latest
            ? {
              temperature: latest.temperature,
              humidity: latest.humidity,
              windSpeed: latest.windSpeed,
              condition: latest.condition,
              timestamp: latest.timestamp,
              location: latest.location,
              latitude: latest.latitude,
              longitude: latest.longitude,
              precipitationProbability: latest.precipitationProbability,
            }
            : null
        }
        location={params.location || undefined}
      />
    </div>
  );
}
