import { Injectable, Logger } from '@nestjs/common';
import { CityWithWeather } from '../../domain/entities/city.entity';
import { CityCache } from '../../infrastructure/cache/city-cache';
import { GeoNamesClient } from '../../infrastructure/clients/geonames-client';
import { NominatimClient } from '../../infrastructure/clients/nominatim-client';
import { OpenMeteoClient } from '../../infrastructure/clients/open-meteo-client';

@Injectable()
export class GetCityDetailUseCase {
  private readonly logger = new Logger(GetCityDetailUseCase.name);

  constructor(
    private readonly cityCache: CityCache,
    private readonly geoNamesClient: GeoNamesClient,
    private readonly nominatimClient: NominatimClient,
    private readonly openMeteoClient: OpenMeteoClient,
  ) { }

  async execute(geonameId: number): Promise<CityWithWeather | null> {
    try {
      let city = await this.findCity(geonameId);

      if (!city) {
        this.logger.warn(
          `Não foi possível encontrar detalhes da cidade com ID ${geonameId}`,
        );
        return null;
      }

      // Buscar clima
      const weather = await this.openMeteoClient.getCurrentWeather(
        city.latitude,
        city.longitude,
      );

      return { ...city, weather };
    } catch (error: any) {
      this.logger.error(
        `Erro ao buscar detalhes da cidade ${geonameId}: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  private async findCity(geonameId: number) {
    const cachedCity = this.cityCache.get(geonameId);
    if (cachedCity) {
      this.logger.debug(`Cidade ${geonameId} encontrada no cache`);
      return cachedCity;
    }

    if (geonameId > 1000000) {
      const city = await this.geoNamesClient.getCityById(geonameId);
      if (city) {
        this.cityCache.set(geonameId, city);
        return city;
      }
    }

    if (cachedCity?.osmId && cachedCity?.osmType) {
      const city = await this.nominatimClient.lookup(
        cachedCity.osmType,
        cachedCity.osmId,
      );
      if (city) {
        this.cityCache.set(geonameId, city);
        return city;
      }
    }

    if (cachedCity) {
      const city = await this.nominatimClient.reverseGeocode(
        cachedCity.latitude,
        cachedCity.longitude,
      );
      if (city) {
        this.cityCache.set(geonameId, city);
        return city;
      }
    }

    if (cachedCity) {
      this.logger.debug(`Usando dados do cache para cidade ${geonameId}`);
      return cachedCity;
    }

    return null;
  }
}

