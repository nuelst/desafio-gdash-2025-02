import { Injectable } from '@nestjs/common';
import { CityInfo } from '../../domain/entities/city.entity';

@Injectable()
export class CityCache {
  private readonly cache = new Map<number, CityInfo>();

  get(geonameId: number): CityInfo | undefined {
    return this.cache.get(geonameId);
  }

  set(geonameId: number, city: CityInfo): void {
    this.cache.set(geonameId, city);
  }

  setMany(cities: CityInfo[]): void {
    for (const city of cities) {
      this.cache.set(city.geonameId, city);
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

