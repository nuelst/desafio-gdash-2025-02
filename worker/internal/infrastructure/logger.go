package infrastructure

import "log"

type Logger interface {
	Info(format string, args ...interface{})
	Error(format string, args ...interface{})
	Warn(format string, args ...interface{})
}

type StdLogger struct{}

func NewLogger() Logger {
	return &StdLogger{}
}

func (l *StdLogger) Info(format string, args ...interface{}) {
	log.Printf("[INFO] "+format, args...)
}

func (l *StdLogger) Error(format string, args ...interface{}) {
	log.Printf("[ERROR] "+format, args...)
}

func (l *StdLogger) Warn(format string, args ...interface{}) {
	log.Printf("[WARN] "+format, args...)
}

