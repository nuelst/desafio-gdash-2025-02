package application

import (
	"encoding/json"
	"fmt"

	"github.com/desafio-gdash-2025-02/go-worker/internal/domain"
	"github.com/desafio-gdash-2025-02/go-worker/internal/infrastructure"
)

type WeatherProcessor struct {
	apiClient infrastructure.APIClient
	logger    infrastructure.Logger
}

func NewWeatherProcessor(apiClient infrastructure.APIClient, logger infrastructure.Logger) *WeatherProcessor {
	return &WeatherProcessor{
		apiClient: apiClient,
		logger:    logger,
	}
}

// Handle implementa a interface MessageHandler diretamente
func (p *WeatherProcessor) Handle(message domain.Message) error {
	var weatherData domain.WeatherData

	if err := json.Unmarshal(message.Body, &weatherData); err != nil {
		p.logger.Error("Erro ao deserializar mensagem: %v", err)
		return fmt.Errorf("erro ao deserializar: %w", err)
	}

	p.logger.Info("Processando dados climáticos de %s (temperatura: %.2f°C)",
		weatherData.Location.Name, weatherData.Current.Temperature)

	request := weatherData.ToAPIRequest()

	if err := p.apiClient.SendWeatherLog(request); err != nil {
		p.logger.Error("Erro ao enviar para API: %v", err)
		return fmt.Errorf("erro ao enviar para API: %w", err)
	}

	p.logger.Info("Mensagem processada com sucesso")
	return nil
}

