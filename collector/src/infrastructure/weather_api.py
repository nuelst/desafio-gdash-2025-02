"""Weather API client"""
from typing import Dict, Optional

import requests

from src.infrastructure.logger import Logger


class WeatherAPI:
    """Client for Open-Meteo weather API"""

    WEATHER_CODES = {
        0: 'clear_sky',
        1: 'mainly_clear',
        2: 'partly_cloudy',
        3: 'overcast',
        45: 'foggy',
        48: 'depositing_rime_fog',
        51: 'light_drizzle',
        53: 'moderate_drizzle',
        55: 'dense_drizzle',
        56: 'light_freezing_drizzle',
        57: 'dense_freezing_drizzle',
        61: 'slight_rain',
        63: 'moderate_rain',
        65: 'heavy_rain',
        66: 'light_freezing_rain',
        67: 'heavy_freezing_rain',
        71: 'slight_snow',
        73: 'moderate_snow',
        75: 'heavy_snow',
        77: 'snow_grains',
        80: 'slight_rain_showers',
        81: 'moderate_rain_showers',
        82: 'violent_rain_showers',
        85: 'slight_snow_showers',
        86: 'heavy_snow_showers',
        95: 'thunderstorm',
        96: 'thunderstorm_with_slight_hail',
        99: 'thunderstorm_with_heavy_hail'
    }

    def __init__(self, base_url: str, logger: Logger):
        self.base_url = base_url
        self.logger = logger

    def fetch_weather_data(
        self, latitude: float, longitude: float
    ) -> Optional[Dict]:
        try:
            params = {
                'latitude': latitude,
                'longitude': longitude,
                'current': 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,precipitation_probability',
                'timezone': 'America/Sao_Paulo'
            }

            response = requests.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            return data

        except requests.exceptions.RequestException as e:
            self.logger.error(f"Erro ao buscar dados climáticos: {e}")
            return None
        except Exception as e:
            self.logger.error(f"Erro inesperado: {e}")
            return None

    @staticmethod
    def get_weather_condition(weather_code: int) -> str:
        return WeatherAPI.WEATHER_CODES.get(weather_code, 'unknown')

