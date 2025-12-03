import { Droplets, Eye, MapPin, Search, Thermometer, Wind } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Skeleton } from '../../components/ui/skeleton';
import { formatCondition } from '../../core/utils';
import { useExplorePage } from '../../hooks';

export default function ExploreView() {
  const {
    page,
    search,
    setSearch,
    selectedCityId,
    data,
    isLoading,
    error,
    cityDetail,
    isLoadingDetail,
    handleSearch,
    handleClearSearch,
    handleCityClick,
    handleCloseDetail,
    handlePreviousPage,
    handleNextPage,
  } = useExplorePage();

  return (
    <div className="px-2 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Explorar Cidades</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Descubra cidades ao redor do mundo e veja o clima atual de cada uma
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Buscar Cidades</CardTitle>
            <CardDescription>Digite o nome de uma cidade para buscar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Ex: São Paulo, New York, Tokyo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 sm:flex-initial">Buscar</Button>
                {search && (
                  <Button type="button" variant="outline" onClick={handleClearSearch} className="flex-1 sm:flex-initial">
                    Limpar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive font-medium mb-2">Erro ao carregar cidades</p>
              <p className="text-sm text-muted-foreground">
                A API de busca de cidades pode estar temporariamente indisponível ou ter excedido o
                limite de requisições. Tente novamente mais tarde ou use uma busca mais específica.
              </p>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : data && data.cities.length > 0 ? (
          <>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-4 sm:mb-6">
              {data.cities.map((city) => (
                <Card
                  key={city.geonameId}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleCityClick(city.geonameId)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{city.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {city.country}
                        </CardDescription>
                      </div>
                      {city.population && (
                        <Badge variant="secondary" className="text-xs">
                          {city.population.toLocaleString()} hab.
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {city.weather ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Thermometer className="h-4 w-4 text-orange-500" />
                            <span className="text-2xl font-bold">
                              {Math.round(city.weather.temperature)}°C
                            </span>
                          </div>
                          <Badge variant="outline">{formatCondition(city.weather.condition)}</Badge>
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Droplets className="h-3 w-3" />
                            {city.weather.humidity}%
                          </div>
                          <div className="flex items-center gap-1">
                            <Wind className="h-3 w-3" />
                            {city.weather.windSpeed} km/h
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Dados climáticos não disponíveis</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Paginação */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
              <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                Mostrando {data.cities.length} de {data.total} cidades
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handlePreviousPage} disabled={page === 1} size="sm" className="text-xs sm:text-sm">
                  Anterior
                </Button>
                <span className="flex items-center px-2 sm:px-4 text-xs sm:text-sm">Página {page}</span>
                <Button variant="outline" onClick={handleNextPage} disabled={!data.hasMore} size="sm" className="text-xs sm:text-sm">
                  Próxima
                </Button>
              </div>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground mb-2">Nenhuma cidade encontrada</p>
              <p className="text-center text-sm text-muted-foreground">
                {search
                  ? `Não encontramos resultados para "${search}". Tente buscar por outro nome ou verifique a ortografia.`
                  : 'Digite o nome de uma cidade no campo de busca acima para começar a explorar.'}
              </p>
              {!search && (
                <div className="text-center text-xs text-muted-foreground mt-2 space-y-1">
                  <p>Exemplos: São Paulo, New York, Tokyo, London, Paris</p>
                  <p className="text-[10px] opacity-75">Dados fornecidos por OpenStreetMap</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Modal de Detalhes */}
        <Dialog open={!!selectedCityId} onOpenChange={handleCloseDetail}>
          <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            {isLoadingDetail ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : cityDetail ? (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">{cityDetail.name}</DialogTitle>
                  <DialogDescription className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {cityDetail.country} ({cityDetail.countryCode})
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Latitude</p>
                      <p className="font-medium">{cityDetail.latitude.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Longitude</p>
                      <p className="font-medium">{cityDetail.longitude.toFixed(4)}</p>
                    </div>
                    {cityDetail.population ? (
                      <div>
                        <p className="text-sm text-muted-foreground">População</p>
                        <p className="font-medium">{cityDetail.population.toLocaleString()}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-muted-foreground">População</p>
                        <p className="font-medium text-muted-foreground">Não disponível</p>
                      </div>
                    )}
                    {cityDetail.timezone ? (
                      <div>
                        <p className="text-sm text-muted-foreground">Fuso Horário</p>
                        <p className="font-medium">{cityDetail.timezone}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-muted-foreground">Fuso Horário</p>
                        <p className="font-medium text-muted-foreground">Não disponível</p>
                      </div>
                    )}
                  </div>

                  {cityDetail.weather && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Eye className="h-5 w-5" />
                          Clima Atual
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Thermometer className="h-5 w-5 text-orange-500" />
                              <span className="text-3xl font-bold">
                                {Math.round(cityDetail.weather.temperature)}°C
                              </span>
                            </div>
                            <Badge variant="outline" className="text-base px-3 py-1">
                              {formatCondition(cityDetail.weather.condition)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div className="flex items-center gap-2">
                              <Droplets className="h-4 w-4 text-blue-500" />
                              <div>
                                <p className="text-sm text-muted-foreground">Umidade</p>
                                <p className="font-medium">{cityDetail.weather.humidity}%</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Wind className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="text-sm text-muted-foreground">Vento</p>
                                <p className="font-medium">{cityDetail.weather.windSpeed} km/h</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            ) : (
              <div>
                <p className="text-muted-foreground">Cidade não encontrada</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
