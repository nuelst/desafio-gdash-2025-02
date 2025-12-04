# Multi-stage build para criar uma imagem única com todos os serviços
# Esta imagem pode ser usada para api, frontend, python-collector e go-worker
# O processo a executar é determinado por variáveis de ambiente

# ============================================
# Stage 1: Backend (NestJS API)
# ============================================
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ .
RUN npm run build

# ============================================
# Stage 2: Frontend (React + Vite)
# ============================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
# Build-time argument para API URL
ARG VITE_API_URL=http://localhost:3000/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ============================================
# Stage 3: Go Worker
# ============================================
FROM golang:1.21-alpine AS go-builder
WORKDIR /app/worker
COPY worker/go.mod worker/go.sum ./
RUN go mod download
COPY worker/ .
RUN go build -o worker main.go

# ============================================
# Stage 4: Python Collector (dependências)
# ============================================
FROM python:3.11-slim AS python-deps
WORKDIR /app/collector
COPY collector/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ============================================
# Stage 5: Runtime (imagem final)
# ============================================
FROM node:20-alpine

# Instalar dependências do sistema
RUN apk add --no-cache \
  python3 \
  py3-pip \
  ca-certificates \
  nginx \
  supervisor \
  && rm -rf /var/cache/apk/*

WORKDIR /app

# Copiar Backend (NestJS)
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Copiar Frontend (React build)
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
COPY frontend/nginx.conf ./frontend/nginx.conf.template

# Copiar Go Worker
COPY --from=go-builder /app/worker/worker ./worker/worker

# Copiar Python Collector
# Instalar dependências Python no runtime
COPY collector/requirements.txt ./collector/
RUN pip3 install --no-cache-dir -r ./collector/requirements.txt
COPY collector/ ./collector/

# Script de entrada que decide qual processo executar
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Expor portas (será usado conforme o serviço)
EXPOSE 3000 80

# Variável de ambiente para determinar qual serviço executar
ENV SERVICE_TYPE=api

# Script de entrada
ENTRYPOINT ["/app/docker-entrypoint.sh"]

