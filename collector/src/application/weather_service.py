"""Application service for weather data collection"""
from datetime import datetime
from typing import Optional

from src.domain.weather import Location, WeatherData
from src.infrastructure.logger import Logger
from src.infrastructure.weather_api import WeatherAPI
from src.infrastructure.weather_mapper import WeatherMapper


class WeatherService:
    def __init__(
        self, weather_api: WeatherAPI, mapper: WeatherMapper, logger: Logger
    ):
        self.weather_api = weather_api
        self.mapper = mapper
        self.logger = logger

    def collect_weather_data(
        self, location: Location
    ) -> Optional[WeatherData]:
        try:
            raw_data = self.weather_api.fetch_weather_data(
                location.latitude, location.longitude
            )
            
            if not raw_data:
                return None

            weather_data = self.mapper.map_to_domain(
                raw_data, location, datetime.utcnow()
            )

            return weather_data

        except Exception as e:
            self.logger.error(f"Erro ao coletar dados climáticos: {e}")
            return None

