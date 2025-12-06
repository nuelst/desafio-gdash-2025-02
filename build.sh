#!/bin/bash

echo "🏗️  Building Weather Dashboard Docker Images..."
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se Docker está rodando
echo -e "${BLUE}🔍 Verificando Docker...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker não está rodando!${NC}"
    echo ""
    echo "Por favor:"
    echo "  1. Inicie o Docker Desktop"
    echo "  2. Aguarde ele inicializar completamente"
    echo "  3. Execute este script novamente"
    echo ""
    exit 1
fi
echo -e "${GREEN}✅ Docker está rodando${NC}"
echo ""

# Verificar se .env existe
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado!${NC}"
    echo "Copiando env.example para .env..."
    cp env.example .env
    echo -e "${YELLOW}📝 Por favor, edite o arquivo .env com suas configurações:${NC}"
    echo ""
    echo "  Variáveis importantes:"
    echo "    • MONGODB_URI"
    echo "    • RABBITMQ_URI"
    echo "    • JWT_SECRET"
    echo "    • ADMIN_EMAIL e ADMIN_PASSWORD"
    echo ""
    read -p "Pressione ENTER para continuar após editar o .env, ou CTRL+C para cancelar..." -r
    echo ""
fi

# Build Backend
echo -e "${BLUE}📦 [1/4] Building Backend (NestJS)...${NC}"
if docker build -t weather-dashboard-backend -f backend/Dockerfile . ; then
    echo -e "${GREEN}✅ Backend build concluído${NC}"
    echo ""
else
    echo -e "${RED}❌ Erro ao fazer build do Backend${NC}"
    echo "Verifique se todos os arquivos do backend estão presentes."
    exit 1
fi

# Build Frontend
echo -e "${BLUE}📦 [2/4] Building Frontend (React)...${NC}"
if docker build -t weather-dashboard-frontend -f frontend/Dockerfile . ; then
    echo -e "${GREEN}✅ Frontend build concluído${NC}"
    echo ""
else
    echo -e "${RED}❌ Erro ao fazer build do Frontend${NC}"
    echo "Verifique se todos os arquivos do frontend estão presentes."
    exit 1
fi

# Build Collector
echo -e "${BLUE}📦 [3/4] Building Collector (Python)...${NC}"
if docker build -t weather-dashboard-collector -f collector/Dockerfile . ; then
    echo -e "${GREEN}✅ Collector build concluído${NC}"
    echo ""
else
    echo -e "${RED}❌ Erro ao fazer build do Collector${NC}"
    echo "Verifique se todos os arquivos do collector estão presentes."
    exit 1
fi

# Build Worker
echo -e "${BLUE}📦 [4/4] Building Worker (Go)...${NC}"
if docker build -t weather-dashboard-worker -f worker/Dockerfile . ; then
    echo -e "${GREEN}✅ Worker build concluído${NC}"
    echo ""
else
    echo -e "${RED}❌ Erro ao fazer build do Worker${NC}"
    echo "Verifique se todos os arquivos do worker estão presentes."
    exit 1
fi

# Resumo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 Build concluído com sucesso!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}📦 Imagens Docker criadas:${NC}"
echo "  ✅ weather-dashboard-backend   (NestJS)"
echo "  ✅ weather-dashboard-frontend  (React)"
echo "  ✅ weather-dashboard-collector (Python)"
echo "  ✅ weather-dashboard-worker    (Go)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🚀 Próximo passo:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Execute:  ${GREEN}./run.sh${NC}"
echo ""
echo "  Isso vai iniciar todos os containers e você poderá"
echo "  acessar a aplicação em http://localhost:5173"
echo ""

