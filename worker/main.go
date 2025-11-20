package main

import (
	"log"

	"github.com/desafio-gdash-2025-02/go-worker/internal/application"
	"github.com/desafio-gdash-2025-02/go-worker/internal/infrastructure"
)

func main() {
	config := infrastructure.LoadConfig()
	logger := infrastructure.NewLogger()

	logger.Info("Iniciando worker Go...")
	logger.Info("RabbitMQ URL: %s", config.RabbitMQURL)
	logger.Info("Queue: %s", config.QueueName)
	logger.Info("API URL: %s", config.APIURL)

	apiClient := infrastructure.NewHTTPAPIClient(
		config.APIURL,
		config.RetryAttempts,
		config.RetryDelay,
		logger,
	)

	rabbitmqClient := infrastructure.NewRabbitMQClient(
		config.RabbitMQURL,
		config.QueueName,
		logger,
	)

	processor := application.NewWeatherProcessor(apiClient, logger)

	if err := rabbitmqClient.Connect(); err != nil {
		logger.Error("Erro ao conectar ao RabbitMQ: %v", err)
		log.Fatal(err)
	}
	defer rabbitmqClient.Close()

	if err := rabbitmqClient.Consume(processor); err != nil {
		logger.Error("Erro ao consumir mensagens: %v", err)
		log.Fatal(err)
	}
}

