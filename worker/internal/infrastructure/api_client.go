package infrastructure

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/desafio-gdash-2025-02/go-worker/internal/domain"
)

type APIClient interface {
	SendWeatherLog(request domain.WeatherLogRequest) error
}

type HTTPAPIClient struct {
	baseURL       string
	retryAttempts int
	retryDelay    int
	httpClient    *http.Client
	logger        Logger
}

func NewHTTPAPIClient(baseURL string, retryAttempts, retryDelay int, logger Logger) APIClient {
	normalizedURL := strings.TrimSuffix(baseURL, "/")
	
	return &HTTPAPIClient{
		baseURL:       normalizedURL,
		retryAttempts: retryAttempts,
		retryDelay:    retryDelay,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		logger: logger,
	}
}

func (c *HTTPAPIClient) SendWeatherLog(request domain.WeatherLogRequest) error {
	jsonData, err := json.Marshal(request)
	if err != nil {
		return fmt.Errorf("erro ao serializar JSON: %w", err)
	}

	url := fmt.Sprintf("%s/api/weather/logs", c.baseURL)

	for attempt := 1; attempt <= c.retryAttempts; attempt++ {
		resp, err := c.httpClient.Post(url, "application/json", bytes.NewBuffer(jsonData))
		if err != nil {
			if attempt < c.retryAttempts {
				c.logger.Warn("Tentativa %d/%d falhou: %v. Aguardando %d segundos...",
					attempt, c.retryAttempts, err, c.retryDelay)
				time.Sleep(time.Duration(c.retryDelay) * time.Second)
				continue
			}
			return fmt.Errorf("erro ao enviar para API após %d tentativas: %w", c.retryAttempts, err)
		}
		defer resp.Body.Close()

		if resp.StatusCode >= 200 && resp.StatusCode < 300 {
			body, _ := io.ReadAll(resp.Body)
			c.logger.Info("Dados enviados com sucesso para API: %s", string(body))
			return nil
		}

		body, _ := io.ReadAll(resp.Body)
		if attempt < c.retryAttempts {
			c.logger.Warn("Tentativa %d/%d retornou status %d: %s. Aguardando %d segundos...",
				attempt, c.retryAttempts, resp.StatusCode, string(body), c.retryDelay)
			time.Sleep(time.Duration(c.retryDelay) * time.Second)
			continue
		}

		return fmt.Errorf("API retornou status %d: %s", resp.StatusCode, string(body))
	}

	return fmt.Errorf("falha ao enviar para API após %d tentativas", c.retryAttempts)
}

