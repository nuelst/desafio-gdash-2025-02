import { Injectable, Logger } from '@nestjs/common';
import {
  CityWithWeather,
  ExploreCitiesResponse,
} from '../../domain/entities/city.entity';
import { CityCache } from '../../infrastructure/cache/city-cache';
import { GeoNamesClient } from '../../infrastructure/clients/geonames-client';
import { NominatimClient } from '../../infrastructure/clients/nominatim-client';
import { OpenMeteoClient } from '../../infrastructure/clients/open-meteo-client';
import { CityDeduplicator } from '../../infrastructure/utils/city-deduplicator';

@Injectable()
export class SearchCitiesUseCase {
  private readonly logger = new Logger(SearchCitiesUseCase.name);

  constructor(
    private readonly nominatimClient: NominatimClient,
    private readonly geoNamesClient: GeoNamesClient,
    private readonly openMeteoClient: OpenMeteoClient,
    private readonly cityCache: CityCache,
  ) { }

  async execute(
    search?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<ExploreCitiesResponse> {
    try {
      let cities = await this.findCities(search, page, limit);

      this.cityCache.setMany(cities);

      const citiesWithWeather = await this.enrichWithWeather(cities);

      const estimatedTotal = search
        ? cities.length
        : await this.estimatePopularCitiesTotal();

      return {
        cities: citiesWithWeather,
        total: estimatedTotal,
        page,
        limit,
        hasMore:
          !search && cities.length === limit && page * limit < estimatedTotal,
      };
    } catch (error: any) {
      this.logger.error(
        `Erro ao buscar cidades: ${error.message}`,
        error.stack,
      );
      throw new Error('Erro ao buscar cidades');
    }
  }

  private async findCities(
    search: string | undefined,
    page: number,
    limit: number,
  ): Promise<CityWithWeather[]> {
    if (search?.trim()) {
      return this.searchCities(search.trim(), limit);
    }

    const startRow = (page - 1) * limit;
    return this.getPopularCities(limit, startRow);
  }

  private async getPopularCities(
    limit: number,
    startRow: number,
  ): Promise<CityWithWeather[]> {
    const cities = await this.geoNamesClient.getPopularCities(limit, startRow);
    return cities;
  }

  private async estimatePopularCitiesTotal(): Promise<number> {
    try {
      const sample = await this.geoNamesClient.getPopularCities(1, 0);
      return sample.length > 0 ? 500 : 0;
    } catch {
      return 0;
    }
  }

  private async searchCities(
    search: string,
    limit: number,
  ): Promise<CityWithWeather[]> {
    let cities = await this.nominatimClient.searchCities(search, limit);
    cities = CityDeduplicator.removeDuplicates(cities);

    if (cities.length === 0) {
      this.logger.debug(
        'Nominatim não retornou resultados, tentando GeoNames...',
      );
      cities = await this.geoNamesClient.searchCities(search, limit);
    }

    return cities.slice(0, limit);
  }

  private async enrichWithWeather(
    cities: CityWithWeather[],
  ): Promise<CityWithWeather[]> {
    return Promise.all(
      cities.map(async (city) => {
        try {
          const weather = await this.openMeteoClient.getCurrentWeather(
            city.latitude,
            city.longitude,
          );
          return { ...city, weather };
        } catch (error: any) {
          this.logger.warn(
            `Erro ao buscar clima para ${city.name}: ${error.message}`,
          );
          return city;
        }
      }),
    );
  }
}

