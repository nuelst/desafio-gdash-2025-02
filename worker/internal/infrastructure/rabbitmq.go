package infrastructure

import (
	"fmt"

	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/desafio-gdash-2025-02/go-worker/internal/domain"
)

const (
	maxRetryAttempts = 5 // Número máximo de tentativas antes de descartar a mensagem
	retryCountHeader = "x-retry-count"
)

type RabbitMQClient interface {
	Connect() error
	Consume(handler domain.MessageHandler) error
	Close() error
}

type AMQPRabbitMQClient struct {
	url      string
	queue    string
	conn     *amqp.Connection
	channel  *amqp.Channel
	logger   Logger
}

func NewRabbitMQClient(url, queue string, logger Logger) RabbitMQClient {
	return &AMQPRabbitMQClient{
		url:    url,
		queue:  queue,
		logger: logger,
	}
}

// Connect conecta ao RabbitMQ
func (c *AMQPRabbitMQClient) Connect() error {
	conn, err := amqp.Dial(c.url)
	if err != nil {
		return fmt.Errorf("falha ao conectar ao RabbitMQ: %w", err)
	}

	ch, err := conn.Channel()
	if err != nil {
		conn.Close()
		return fmt.Errorf("falha ao abrir canal: %w", err)
	}

	_, err = ch.QueueDeclare(
		c.queue,
		true,  // durable
		false, // delete when unused
		false, // exclusive
		false, // no-wait
		nil,   // arguments
	)
	if err != nil {
		ch.Close()
		conn.Close()
		return fmt.Errorf("falha ao declarar fila: %w", err)
	}

	err = ch.Qos(
		1,     // prefetch count
		0,     // prefetch size
		false, // global
	)
	if err != nil {
		ch.Close()
		conn.Close()
		return fmt.Errorf("erro ao configurar QoS: %w", err)
	}

	c.conn = conn
	c.channel = ch
	c.logger.Info("Conectado ao RabbitMQ com sucesso")
	return nil
}

func (c *AMQPRabbitMQClient) Consume(handler domain.MessageHandler) error {
	msgs, err := c.channel.Consume(
		c.queue,
		"",    // consumer
		false, // auto-ack (vamos fazer manualmente)
		false, // exclusive
		false, // no-local
		false, // no-wait
		nil,   // args
	)
	if err != nil {
		return fmt.Errorf("erro ao registrar consumidor: %w", err)
	}

	c.logger.Info("Aguardando mensagens. Para sair, pressione CTRL+C")

	for msg := range msgs {
		message := domain.Message{
			Body:    msg.Body,
			Headers: msg.Headers,
		}

		if err := handler.Handle(message); err != nil {
			retryCount := c.getRetryCount(msg.Headers)
			
			if retryCount >= maxRetryAttempts {
				c.logger.Error("Mensagem descartada após %d tentativas falhadas: %v", retryCount, err)
				msg.Nack(false, false) // Rejeitar sem reenfileirar (descartar mensagem)
				continue
			}

			// Incrementar contador de tentativas
			if msg.Headers == nil {
				msg.Headers = make(amqp.Table)
			}
			msg.Headers[retryCountHeader] = retryCount + 1

			c.logger.Warn("Erro ao processar mensagem (tentativa %d/%d): %v", retryCount+1, maxRetryAttempts, err)
			msg.Nack(false, true) // Rejeitar e reenfileirar para retry
			continue
		}

		msg.Ack(false) // Confirmar processamento
	}

	return nil
}

func (c *AMQPRabbitMQClient) getRetryCount(headers amqp.Table) int {
	if headers == nil {
		return 0
	}
	
	if count, ok := headers[retryCountHeader]; ok {
		if countInt, ok := count.(int); ok {
			return countInt
		}
		if countInt, ok := count.(int32); ok {
			return int(countInt)
		}
		if countInt, ok := count.(int64); ok {
			return int(countInt)
		}
	}
	
	return 0
}

func (c *AMQPRabbitMQClient) Close() error {
	if c.channel != nil {
		c.channel.Close()
	}
	if c.conn != nil {
		return c.conn.Close()
	}
	return nil
}

