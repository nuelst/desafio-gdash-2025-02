"""Main entry point for weather data collector"""
from dotenv import load_dotenv
from src.application.collector import WeatherCollector
from src.infrastructure.config import Config

if __name__ == '__main__':
    # Load environment variables from .env file
    load_dotenv()
    
    config = Config.from_env()
    collector = WeatherCollector(config)
    collector.start()

