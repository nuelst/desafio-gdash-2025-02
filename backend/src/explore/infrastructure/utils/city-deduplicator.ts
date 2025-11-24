import { CityInfo } from '../../domain/entities/city.entity';

export class CityDeduplicator {
  private static readonly TOLERANCE = 0.01; // ~1km de tolerância para coordenadas

  static removeDuplicates(cities: CityInfo[]): CityInfo[] {
    const seen = new Map<string, CityInfo>();

    for (const city of cities) {
      const normalizedName = city.name.toLowerCase().trim();
      const latKey = Math.round(city.latitude / this.TOLERANCE);
      const lonKey = Math.round(city.longitude / this.TOLERANCE);
      const key = `${normalizedName}_${latKey}_${lonKey}`;

      if (!seen.has(key)) {
        seen.set(key, city);
      } else {
        const existing = seen.get(key)!;
        if (
          (!existing.population && city.population) ||
          (!existing.timezone && city.timezone)
        ) {
          seen.set(key, city);
        }
      }
    }

    return Array.from(seen.values());
  }
}

