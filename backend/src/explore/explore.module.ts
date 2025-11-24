import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  GetCityDetailUseCase,
  SearchCitiesUseCase,
} from './application/use-cases';
import { ExploreController } from './explore.controller';
import { ExploreService } from './explore.service';
import { CityCache } from './infrastructure/cache/city-cache';
import { GeoNamesClient } from './infrastructure/clients/geonames-client';
import { NominatimClient } from './infrastructure/clients/nominatim-client';
import { OpenMeteoClient } from './infrastructure/clients/open-meteo-client';

@Module({
  imports: [ConfigModule],
  controllers: [ExploreController],
  providers: [
    ExploreService,
    SearchCitiesUseCase,
    GetCityDetailUseCase,
    CityCache,
    NominatimClient,
    GeoNamesClient,
    OpenMeteoClient,
  ],
  exports: [ExploreService],
})
export class ExploreModule { }
