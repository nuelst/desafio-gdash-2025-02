"""Mapper for converting API data to domain models"""
from datetime import datetime
from typing import Dict

from src.domain.weather import CurrentWeather, Location, WeatherData


class WeatherMapper:

    def __init__(self, weather_api):
        self.weather_api = weather_api

    def map_to_domain(
        self, raw_data: Dict, location: Location, timestamp: datetime
    ) -> WeatherData:
        current = raw_data.get('current', {})

        current_weather = CurrentWeather(
            temperature=current.get('temperature_2m'),
            humidity=current.get('relative_humidity_2m'),
            wind_speed=current.get('wind_speed_10m'),
            weather_code=current.get('weather_code'),
            condition=self.weather_api.get_weather_condition(
                current.get('weather_code')
            ),
            precipitation_probability=current.get('precipitation_probability', 0.0)
        )

        return WeatherData(
            timestamp=timestamp,
            location=location,
            current=current_weather
        )

