import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { CityInfo } from '../../domain/entities/city.entity';

@Injectable()
export class GeoNamesClient {
  private readonly logger = new Logger(GeoNamesClient.name);
  private readonly client: AxiosInstance;
  private readonly username: string;

  constructor(private readonly configService: ConfigService) {
    this.username = this.configService.get<string>('geonames.username') || 'demo';
    this.client = axios.create({
      baseURL: 'http://api.geonames.org',
      timeout: 10000,
    });
  }

  async searchCities(search: string, limit: number): Promise<CityInfo[]> {
    const strategies = [
      {
        name_startsWith: search,
        featureClass: 'P',
        featureCode: 'PPL',
      },
      {
        name: search,
        featureClass: 'P',
      },
    ];

    for (const strategy of strategies) {
      try {
        const params: any = {
          username: this.username,
          type: 'json',
          maxRows: limit,
          startRow: 0,
          orderBy: 'population',
          ...strategy,
        };

        const response = await this.client.get('/search', { params });

        if (response.data.status) {
          continue;
        }

        const cities = (response.data.geonames || []).map((city: any) => ({
          geonameId: city.geonameId,
          name: city.name,
          country: city.countryName,
          countryCode: city.countryCode,
          latitude: Number.parseFloat(city.lat),
          longitude: Number.parseFloat(city.lng),
          population: city.population ? Number.parseInt(city.population) : undefined,
          timezone: city.timezone?.timeZoneId,
        }));

        if (cities.length > 0) {
          return cities;
        }
      } catch (error: any) {
        continue;
      }
    }

    return [];
  }

  async getCityById(geonameId: number): Promise<CityInfo | null> {
    try {
      const response = await this.client.get('/getJSON', {
        params: {
          username: this.username,
          geonameId,
        },
      });

      if (response.data && !response.data.status) {
        return {
          geonameId: response.data.geonameId,
          name: response.data.name,
          country: response.data.countryName,
          countryCode: response.data.countryCode,
          latitude: Number.parseFloat(response.data.lat),
          longitude: Number.parseFloat(response.data.lng),
          population: response.data.population
            ? Number.parseInt(response.data.population)
            : undefined,
          timezone: response.data.timezone?.timeZoneId,
        };
      }
    } catch (error: any) {
      this.logger.debug(`GeoNames não encontrou cidade com ID ${geonameId}`);
    }

    return null;
  }

  async getPopularCities(limit: number, startRow: number = 0): Promise<CityInfo[]> {
    try {
      const response = await this.client.get('/search', {
        params: {
          username: this.username,
          type: 'json',
          featureClass: 'P',
          featureCode: 'PPL',
          maxRows: limit,
          startRow: startRow,
          orderBy: 'population',
        },
      });

      if (response.data.status) {
        this.logger.warn('GeoNames retornou erro ao buscar cidades populares');
        return [];
      }

      return (response.data.geonames || []).map((city: any) => ({
        geonameId: city.geonameId,
        name: city.name,
        country: city.countryName,
        countryCode: city.countryCode,
        latitude: Number.parseFloat(city.lat),
        longitude: Number.parseFloat(city.lng),
        population: city.population ? Number.parseInt(city.population) : undefined,
        timezone: city.timezone?.timeZoneId,
      }));
    } catch (error: any) {
      this.logger.warn(
        `Erro ao buscar cidades populares com GeoNames: ${error.message}`,
      );
      return [];
    }
  }
}

