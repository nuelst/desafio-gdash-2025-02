import { Injectable } from '@nestjs/common';
import {
  GetCityDetailUseCase,
  SearchCitiesUseCase,
} from './application/use-cases';
import type {
  CityWithWeather,
  ExploreCitiesResponse,
} from './domain/entities/city.entity';

export type { CityWithWeather, ExploreCitiesResponse };

@Injectable()
export class ExploreService {
  constructor(
    private readonly searchCitiesUseCase: SearchCitiesUseCase,
    private readonly getCityDetailUseCase: GetCityDetailUseCase,
  ) { }

  async searchCities(
    search?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<ExploreCitiesResponse> {
    return this.searchCitiesUseCase.execute(search, page, limit);
  }

  async getCityDetail(geonameId: number): Promise<CityWithWeather | null> {
    return this.getCityDetailUseCase.execute(geonameId);
  }
}
