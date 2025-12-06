#!/bin/bash

echo "🛑 Stopping Weather Dashboard..."
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Parar containers
echo -e "${BLUE}🐳 Parando containers...${NC}"
docker compose down

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Containers parados com sucesso!${NC}"
    echo ""
    echo -e "${YELLOW}💡 Para iniciar novamente: ./run.sh${NC}"
    echo ""
else
    echo ""
    echo "❌ Erro ao parar containers"
    exit 1
fi

