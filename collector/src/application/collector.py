"""Weather data collector application"""
import signal
import sys
import time
from typing import Optional

from src.domain.weather import Location, WeatherData
from src.infrastructure.config import Config
from src.infrastructure.logger import get_logger
from src.infrastructure.rabbitmq_client import RabbitMQClient
from src.infrastructure.weather_api import WeatherAPI
from src.infrastructure.weather_mapper import WeatherMapper
from src.application.weather_service import WeatherService


class WeatherCollector:
    """Main weather data collector application"""

    def __init__(self, config: Config):
        self.config = config
        self.logger = get_logger(__name__)
        self.running = True

        weather_api = WeatherAPI(config.open_meteo_url, self.logger)
        mapper = WeatherMapper(weather_api)
        self.weather_service = WeatherService(weather_api, mapper, self.logger)
        self.rabbitmq_client = RabbitMQClient(
            config.rabbitmq_url, config.rabbitmq_queue, self.logger
        )

        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)

    def _signal_handler(self, signum, frame):
        """Handle shutdown signals"""
        self.logger.info("Recebido sinal de interrupção, encerrando...")
        self.running = False

    def start(self):
        """Start the collector"""
        self.logger.info("Iniciando coletor de dados climáticos...")
        self.logger.info(f"Localizações configuradas: {len(self.config.locations)}")
        for loc in self.config.locations:
            self.logger.info(
                f"  - {loc.name} ({loc.latitude}, {loc.longitude})"
            )
        self.logger.info(
            f"Intervalo de coleta: {self.config.collect_interval} segundos"
        )

        if not self.rabbitmq_client.connect():
            self.logger.error("Falha ao conectar ao RabbitMQ")
            sys.exit(1)

        while self.running:
            try:
                self._collect_and_publish()
                self.logger.info(
                    f"Aguardando {self.config.collect_interval} segundos "
                    "até a próxima coleta..."
                )
                time.sleep(self.config.collect_interval)
            except KeyboardInterrupt:
                self.logger.info("Interrompendo coletor...")
                break
            except Exception as e:
                self.logger.error(f"Erro no loop principal: {e}")
                time.sleep(60)  # Wait 1 minute before retrying

        # Cleanup
        self.rabbitmq_client.close()

    def _collect_and_publish(self):
        """Collect weather data and publish to RabbitMQ for all locations"""
        for loc_config in self.config.locations:
            try:
                location = Location(
                    name=loc_config.name,
                    latitude=loc_config.latitude,
                    longitude=loc_config.longitude
                )

                weather_data: Optional[WeatherData] = (
                    self.weather_service.collect_weather_data(location)
                )

                if weather_data:
                    self.rabbitmq_client.publish(weather_data)
                    self.logger.info(
                        f"Dados coletados e publicados para {location.name}"
                    )
                else:
                    self.logger.warning(
                        f"Não foi possível coletar dados climáticos para {location.name}"
                    )
            except Exception as e:
                self.logger.error(
                    f"Erro ao coletar dados para {loc_config.name}: {e}"
                )
              