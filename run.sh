#!/bin/bash

echo "🚀 Starting Weather Dashboard..."
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se .env existe
if [ ! -f .env ]; then
    echo -e "${RED}❌ Arquivo .env não encontrado!${NC}"
    echo "Por favor, copie env.example para .env e configure as variáveis."
    echo "Execute: cp env.example .env"
    exit 1
fi

# Verificar se Docker está rodando
echo -e "${BLUE}🔍 Verificando Docker...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker não está rodando!${NC}"
    echo ""
    echo "Por favor:"
    echo "  1. Inicie o Docker Desktop"
    echo "  2. Aguarde ele inicializar completamente (pode levar 1-2 minutos)"
    echo "  3. Execute este script novamente: ./run.sh"
    echo ""
    exit 1
fi
echo -e "${GREEN}✅ Docker está rodando${NC}"
echo ""

# Verificar se as imagens foram buildadas
echo -e "${BLUE}🔍 Verificando imagens Docker...${NC}"

images_ok=true

if ! docker images | grep -q "weather-dashboard-backend"; then
    echo -e "${YELLOW}⚠️  Imagem do Backend não encontrada${NC}"
    images_ok=false
fi

if ! docker images | grep -q "weather-dashboard-frontend"; then
    echo -e "${YELLOW}⚠️  Imagem do Frontend não encontrada${NC}"
    images_ok=false
fi

if ! docker images | grep -q "weather-dashboard-collector"; then
    echo -e "${YELLOW}⚠️  Imagem do Collector não encontrada${NC}"
    images_ok=false
fi

if ! docker images | grep -q "weather-dashboard-worker"; then
    echo -e "${YELLOW}⚠️  Imagem do Worker não encontrada${NC}"
    images_ok=false
fi

if [ "$images_ok" = false ]; then
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}⚠️  Imagens Docker não encontradas${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "É necessário fazer build das imagens primeiro."
    echo ""
    echo -e "${BLUE}Opção 1:${NC} Fazer build agora automaticamente"
    echo -e "${BLUE}Opção 2:${NC} Cancelar e executar './build.sh' manualmente"
    echo ""
    read -p "Deseja fazer build agora? (s/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        echo ""
        ./build.sh || exit 1
        echo ""
        echo -e "${GREEN}Continuando com o start dos containers...${NC}"
        echo ""
    else
        echo ""
        echo "Cancelado. Execute './build.sh' quando estiver pronto."
        exit 1
    fi
fi

echo -e "${GREEN}✅ Todas as imagens encontradas${NC}"
echo ""

# Iniciar containers com Docker Compose
echo -e "${BLUE}🐳 Iniciando containers com Docker Compose...${NC}"
docker compose up -d

# Verificar se iniciou com sucesso
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 Weather Dashboard está rodando!${NC}"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BLUE}📱 Acesse as aplicações:${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "  🌐 Frontend:      http://localhost:5173"
    echo "  🔌 Backend API:   http://localhost:3000"
    echo "  📚 Swagger:       http://localhost:3000/docs"
    echo "  🐰 RabbitMQ:      http://localhost:15672"
    echo "     (user: guest / pass: guest)"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BLUE}🔐 Login padrão (configurável no .env):${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "  Email: admin@example.com"
    echo "  Senha: Admin123!"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BLUE}📋 Comandos úteis:${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "  Ver logs:         docker compose logs -f"
    echo "  Ver logs backend: docker compose logs -f api"
    echo "  Ver logs worker:  docker compose logs -f worker"
    echo "  Parar:            docker compose down"
    echo "  Reiniciar:        docker compose restart"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Erro ao iniciar containers${NC}"
    echo "Verifique os logs com: docker compose logs"
    exit 1
fi

