#!/bin/sh
set -e

# Determinar qual serviço executar baseado em SERVICE_TYPE
case "${SERVICE_TYPE}" in
  api)
    echo "🚀 Starting NestJS API..."
    cd /app/backend
    exec node dist/main
    ;;
  
  frontend)
    echo "🌐 Starting Frontend (Nginx)..."
    # Copiar configuração do nginx
    cp /app/frontend/nginx.conf.template /etc/nginx/conf.d/default.conf
    exec nginx -g "daemon off;"
    ;;
  
  python-collector)
    echo "🐍 Starting Python Collector..."
    cd /app/collector
    exec python main.py
    ;;
  
  go-worker)
    echo "🔧 Starting Go Worker..."
    exec /app/worker/worker
    ;;
  
  workers)
    echo "🔧 Starting Python Collector and Go Worker with Supervisor..."
    
    # Criar configuração do supervisor dinamicamente
    cat > /etc/supervisord.conf <<EOF
[supervisord]
nodaemon=true
logfile=/dev/stdout
logfile_maxbytes=0

[program:python-collector]
command=python /app/collector/main.py
directory=/app/collector
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
environment=RABBITMQ_URI="${RABBITMQ_URI}",RABBITMQ_QUEUE="${RABBITMQ_QUEUE}",WEATHER_LOCATIONS="${WEATHER_LOCATIONS}",COLLECTION_INTERVAL_SECONDS="${COLLECTION_INTERVAL_SECONDS}",OPEN_METEO_URL="${OPEN_METEO_URL}"

[program:go-worker]
command=/app/worker/worker
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
environment=RABBITMQ_URI="${RABBITMQ_URI}",RABBITMQ_QUEUE="${RABBITMQ_QUEUE}",NESTJS_API_URL="${NESTJS_API_URL}",RETRY_ATTEMPTS="${RETRY_ATTEMPTS}",RETRY_DELAY="${RETRY_DELAY}"
EOF
    
    exec supervisord -c /etc/supervisord.conf
    ;;
  
  *)
    echo "❌ Error: SERVICE_TYPE must be one of: api, frontend, python-collector, go-worker, workers"
    echo "Current SERVICE_TYPE: ${SERVICE_TYPE}"
    exit 1
    ;;
esac

