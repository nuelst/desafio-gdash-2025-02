"""Configuration management"""
import json
import os
from dataclasses import dataclass
from typing import List


@dataclass
class LocationConfig:
    name: str
    latitude: float
    longitude: float


@dataclass
class Config:
    rabbitmq_url: str
    rabbitmq_queue: str
    locations: List[LocationConfig]
    collect_interval: int
    open_meteo_url: str

    @classmethod
    def from_env(cls) -> 'Config':
        locations_json = os.getenv('WEATHER_LOCATIONS')
        
        if locations_json:
            try:
                locations_data = json.loads(locations_json)
                locations = [
                    LocationConfig(
                        name=loc['name'],
                        latitude=float(loc['latitude']),
                        longitude=float(loc['longitude'])
                    )
                    for loc in locations_data
                ]
            except (json.JSONDecodeError, KeyError, ValueError) as e:
                raise ValueError(f"Erro ao parsear WEATHER_LOCATIONS: {e}")
        else:
            single_location = os.getenv('WEATHER_LOCATION')
            single_latitude = os.getenv('LOCATION_LATITUDE')
            single_longitude = os.getenv('LOCATION_LONGITUDE')
            
            if single_location and single_latitude and single_longitude:
                locations = [
                    LocationConfig(
                        name=single_location,
                        latitude=float(single_latitude),
                        longitude=float(single_longitude)
                    )
                ]
            else:
                locations = [
                    LocationConfig(
                        name='São Paulo, BR',
                        latitude=-23.55052,
                        longitude=-46.63330
                    ),
                    LocationConfig(
                        name='Luanda, Angola',
                        latitude=-8.8383,
                        longitude=13.2344
                    )
                ]
        
        return cls(
            rabbitmq_url=os.getenv(
                'RABBITMQ_URI', 'amqp://guest:guest@localhost:5672/'
            ),
            rabbitmq_queue=os.getenv('RABBITMQ_QUEUE', 'weather-data'),
            locations=locations,
            collect_interval=int(os.getenv('COLLECTION_INTERVAL_SECONDS', '3600')),
            open_meteo_url=os.getenv(
                'OPEN_METEO_URL',
                'https://api.open-meteo.com/v1/forecast'
            ),
        )

