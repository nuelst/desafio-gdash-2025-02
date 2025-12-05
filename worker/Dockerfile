FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copiar go.mod e go.sum - funciona com ou sem root directory
COPY worker/go.mod worker/go.sum ./
RUN go mod download

# Copiar código fonte
COPY worker/ .
RUN go build -o worker main.go

FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

COPY --from=builder /app/worker .

CMD ["./worker"]

