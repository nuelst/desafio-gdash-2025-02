package infrastructure

import (
	"os"
	"strconv"
)

type Config struct {
	RabbitMQURL   string
	QueueName     string
	APIURL        string
	RetryAttempts int
	RetryDelay    int
}

func LoadConfig() *Config {
	return &Config{
		RabbitMQURL:   getEnv("RABBITMQ_URI", "amqp://guest:guest@localhost:5672/"),
		QueueName:     getEnv("RABBITMQ_QUEUE", "weather-data"),
		APIURL:        getEnv("NESTJS_API_URL", "http://localhost:3000"),
		RetryAttempts: getEnvInt("RETRY_ATTEMPTS", 3),
		RetryDelay:    getEnvInt("RETRY_DELAY", 5),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if result, err := strconv.Atoi(value); err == nil {
			return result
		}
	}
	return defaultValue
}

