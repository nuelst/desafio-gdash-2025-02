import { apiClient } from './client';

export interface CityInfo {
  geonameId: number;
  name: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  population?: number;
  timezone?: string;
}

export interface CityWeather {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  weatherCode: number;
}

export interface CityWithWeather extends CityInfo {
  weather?: CityWeather;
}

export interface ExploreCitiesResponse {
  cities: CityWithWeather[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ExploreCitiesParams {
  search?: string;
  page?: number;
  limit?: number;
}

export const exploreApi = {
  getCities: async (params: ExploreCitiesParams = {}): Promise<ExploreCitiesResponse> => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get<ExploreCitiesResponse>(
      `/explore/cities?${queryParams.toString()}`,
    );
    return response.data;
  },

  getCityDetail: async (geonameId: number): Promise<CityWithWeather | null> => {
    const response = await apiClient.get<CityWithWeather>(
      `/explore/cities/${geonameId}`,
    );
    return response.data;
  },
};

