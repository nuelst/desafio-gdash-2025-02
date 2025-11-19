"""RabbitMQ client"""
import json
import time
from typing import Optional

import pika

from src.domain.weather import WeatherData
from src.infrastructure.logger import Logger


class RabbitMQClient:
    """Client for RabbitMQ messaging"""

    def __init__(self, url: str, queue: str, logger: Logger):
        self.url = url
        self.queue = queue
        self.logger = logger
        self.connection: Optional[pika.BlockingConnection] = None
        self.channel: Optional[pika.channel.Channel] = None

    def connect(self, max_retries: int = 5, retry_delay: int = 10) -> bool:
        
        for attempt in range(max_retries):
            try:
                self.connection = pika.BlockingConnection(
                    pika.URLParameters(self.url)
                )
                self.channel = self.connection.channel()
                self.channel.queue_declare(queue=self.queue, durable=True)
                self.logger.info("Conectado ao RabbitMQ com sucesso")
                return True
            except Exception as e:
                self.logger.warning(
                    f"Tentativa {attempt + 1}/{max_retries} de conexão ao "
                    f"RabbitMQ falhou: {e}"
                )
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
                else:
                    self.logger.error(
                        "Não foi possível conectar ao RabbitMQ após várias tentativas"
                    )
                    return False
        return False

    def publish(self, weather_data: WeatherData) -> bool:
        try:
            if not self.channel or self.channel.is_closed:
                self.logger.error("Canal RabbitMQ não está disponível")
                return False

            message = json.dumps(weather_data.to_dict())
            self.channel.basic_publish(
                exchange='',
                routing_key=self.queue,
                body=message,
                properties=pika.BasicProperties(
                    delivery_mode=2,  # Make message persistent
                    content_type='application/json'
                )
            )
            self.logger.info(
                f"Dados enviados para RabbitMQ: {weather_data.location.name}"
            )
            return True
        except Exception as e:
            self.logger.error(f"Erro ao enviar para RabbitMQ: {e}")
            return False

    def close(self):
        if self.connection and not self.connection.is_closed:
            self.connection.close()
            self.logger.info("Conexão com RabbitMQ fechada")

