"""Domain models for weather data"""
from dataclasses import dataclass
from datetime import datetime


@dataclass
class Location:
    name: str
    latitude: float
    longitude: float


@dataclass
class CurrentWeather:
    temperature: float
    humidity: float
    wind_speed: float
    weather_code: int
    condition: str
    precipitation_probability: float


@dataclass
class WeatherData:
    timestamp: datetime
    location: Location
    current: CurrentWeather

    def to_dict(self) -> dict:
        if self.timestamp.tzinfo is None:
            from datetime import timezone
            timestamp_utc = self.timestamp.replace(tzinfo=timezone.utc)
        else:
            timestamp_utc = self.timestamp.astimezone(timezone.utc)
        
        return {
            'timestamp': timestamp_utc.isoformat().replace('+00:00', 'Z'),
            'location': {
                'name': self.location.name,
                'latitude': self.location.latitude,
                'longitude': self.location.longitude
            },
            'current': {
                'temperature': self.current.temperature,
                'humidity': self.current.humidity,
                'wind_speed': self.current.wind_speed,
                'weather_code': self.current.weather_code,
                'condition': self.current.condition,
                'precipitation_probability': self.current.precipitation_probability
            }
        }

