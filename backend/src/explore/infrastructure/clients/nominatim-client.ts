import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { CityInfo } from '../../domain/entities/city.entity';

@Injectable()
export class NominatimClient {
  private readonly logger = new Logger(NominatimClient.name);
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://nominatim.openstreetmap.org',
      timeout: 20000,
      headers: {
        'User-Agent': 'WeatherDashboard/1.0',
      },
    });
  }

  async searchCities(search: string, limit: number): Promise<CityInfo[]> {
    try {
      const response = await this.client.get('/search', {
        params: {
          q: search,
          format: 'json',
          limit: Math.min(limit * 3, 50),
          addressdetails: 1,
        },
      });

      const results = response.data || [];

      return results
        .filter((place: any) => {
          const addresstype = place.addresstype || '';
          const type = place.type || '';
          const classType = place.class || '';

          return (
            addresstype === 'city' ||
            addresstype === 'town' ||
            addresstype === 'village' ||
            (type === 'administrative' && classType === 'boundary') ||
            classType === 'place'
          );
        })
        .map((place: any) => {
          const address = place.address || {};
          const cityName =
            place.name ||
            address.city ||
            address.town ||
            address.village ||
            place.display_name?.split(',')[0] ||
            'Unknown';

          const osmType = place.osm_type?.[0]?.toUpperCase() || 'N';
          const osmId = place.osm_id;

          return {
            geonameId: place.place_id || Math.floor(Date.now() + Math.random() * 1000),
            name: cityName,
            country: address.country || 'Unknown',
            countryCode: address.country_code?.toUpperCase() || 'XX',
            latitude: Number.parseFloat(place.lat),
            longitude: Number.parseFloat(place.lon),
            population: undefined,
            timezone: undefined,
            placeId: place.place_id,
            osmId: osmId,
            osmType: osmType,
          };
        });
    } catch (error: any) {
      this.logger.warn(`Erro ao buscar cidades com Nominatim: ${error.message}`);
      return [];
    }
  }

  async lookup(osmType: string, osmId: number): Promise<CityInfo | null> {
    try {
      const response = await this.client.get('/lookup', {
        params: {
          osm_ids: `${osmType}${osmId}`,
          format: 'json',
          addressdetails: 1,
        },
      });

      const place = response.data?.[0];
      if (!place) return null;

      const address = place.address || {};
      return {
        geonameId: place.place_id,
        name:
          place.name ||
          address.city ||
          address.town ||
          address.village ||
          place.display_name?.split(',')[0] ||
          'Unknown',
        country: address.country || 'Unknown',
        countryCode: address.country_code?.toUpperCase() || 'XX',
        latitude: Number.parseFloat(place.lat),
        longitude: Number.parseFloat(place.lon),
        population: undefined,
        timezone: undefined,
        placeId: place.place_id,
        osmId: place.osm_id,
        osmType: place.osm_type?.[0]?.toUpperCase(),
      };
    } catch (error: any) {
      this.logger.debug(`Nominatim lookup falhou: ${error.message}`);
      return null;
    }
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<CityInfo | null> {
    try {
      const response = await this.client.get('/reverse', {
        params: {
          lat: latitude,
          lon: longitude,
          format: 'json',
          addressdetails: 1,
        },
      });

      const place = response.data;
      if (!place) return null;

      const address = place.address || {};
      return {
        geonameId: place.place_id,
        name:
          place.name ||
          address.city ||
          address.town ||
          address.village ||
          place.display_name?.split(',')[0] ||
          'Unknown',
        country: address.country || 'Unknown',
        countryCode: address.country_code?.toUpperCase() || 'XX',
        latitude: Number.parseFloat(place.lat),
        longitude: Number.parseFloat(place.lon),
        population: undefined,
        timezone: undefined,
        placeId: place.place_id,
        osmId: place.osm_id,
        osmType: place.osm_type?.[0]?.toUpperCase(),
      };
    } catch (error: any) {
      this.logger.debug(`Nominatim reverse geocoding falhou: ${error.message}`);
      return null;
    }
  }
}

