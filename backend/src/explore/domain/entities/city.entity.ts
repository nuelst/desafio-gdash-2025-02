export interface CityInfo {
  geonameId: number;
  name: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  population?: number;
  timezone?: string;
  placeId?: number; // place_id do Nominatim
  osmId?: number; // osm_id do OpenStreetMap
  osmType?: string; // osm_type: 'R' (relation), 'W' (way), 'N' (node)
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

