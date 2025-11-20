package domain

type Message struct {
	Body    []byte
	Headers map[string]interface{}
}

type MessageHandler interface {
	Handle(message Message) error
}

