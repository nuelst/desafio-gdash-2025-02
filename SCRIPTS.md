# 📜 Scripts do Projeto

Scripts shell para facilitar o build e execução do projeto.

---

## 🚀 Uso Rápido

### 1. Inicie o Docker Desktop
**Importante:** Certifique-se que o Docker Desktop está rodando antes de executar qualquer script.

### 2. Configure as Variáveis
```bash
cp env.example .env
# Edite o .env com suas configurações
```

### 3. Build das Imagens
```bash
./build.sh
```

### 4. Rodar o Projeto
```bash
./run.sh
```

### 5. Parar o Projeto
```bash
./stop.sh
```

---

## 📋 Scripts Disponíveis

### `build.sh` - Build das Imagens Docker
Cria as imagens Docker de todos os serviços.

**O que faz:**
- ✅ Verifica se Docker está rodando
- ✅ Verifica se `.env` existe
- ✅ Faz build de 4 imagens:
  - Backend (NestJS)
  - Frontend (React)
  - Collector (Python)
  - Worker (Go)
- ⏱️ Tempo: ~5-10 minutos na primeira vez

**Quando usar:**
- Primeira vez que vai rodar o projeto
- Depois de fazer mudanças no código
- Depois de mudar dependências (package.json, requirements.txt, etc)

### `run.sh` - Iniciar o Projeto
Inicia todos os containers com Docker Compose.

**O que faz:**
- ✅ Verifica se Docker está rodando
- ✅ Verifica se `.env` existe
- ✅ Verifica se imagens foram buildadas
- ✅ Inicia todos os containers
- ✅ Mostra URLs de acesso

**Quando usar:**
- Para iniciar o projeto após build
- Para reiniciar o projeto
- Todas as vezes que quiser rodar

### `stop.sh` - Parar o Projeto
Para todos os containers em execução.

**O que faz:**
- ✅ Executa `docker compose down`
- ✅ Para todos os serviços

**Quando usar:**
- Quando terminar de usar o projeto
- Antes de fazer mudanças que requerem rebuild
- Para liberar recursos do sistema

---

## ⚠️ Problemas Comuns

### "Docker daemon not running"
```bash
# Solução:
1. Abra o Docker Desktop
2. Aguarde ele inicializar (1-2 minutos)
3. Execute o script novamente
```

### "Permission denied"
```bash
# Solução:
chmod +x build.sh run.sh stop.sh
```

### "Arquivo .env não encontrado"
```bash
# Solução:
cp env.example .env
# Depois edite o .env com suas configurações
```

### "Port already in use"
```bash
# Solução:
# Verifique se há outro serviço usando as portas
lsof -i :3000  # Backend
lsof -i :5173  # Frontend
lsof -i :27017 # MongoDB
lsof -i :5672  # RabbitMQ

# Ou pare todos os containers
docker compose down
```

---

## 🔧 Comandos Manuais

Se preferir não usar os scripts:

### Build Manual
```bash
# Build todas as imagens
docker compose build

# Ou build individual
docker build -t weather-dashboard-backend -f backend/Dockerfile .
docker build -t weather-dashboard-frontend -f frontend/Dockerfile .
docker build -t weather-dashboard-collector -f collector/Dockerfile .
docker build -t weather-dashboard-worker -f worker/Dockerfile .
```

### Rodar Manual
```bash
docker compose up -d
```

### Parar Manual
```bash
docker compose down
```

---

## 📚 Mais Informações

- [QUICK_START.md](./QUICK_START.md) - Guia completo de início rápido
- [ABOUT.md](./ABOUT.md) - Documentação completa do projeto
- [README.md](./README.md) - Requisitos e descrição do desafio

---

## 💡 Dicas

✅ **Primeira vez?** Execute na ordem: `build.sh` → `run.sh`

✅ **Mudou código?** Execute: `stop.sh` → `build.sh` → `run.sh`

✅ **Só mudou .env?** Execute: `stop.sh` → `run.sh`

✅ **Ver logs?** Execute: `docker compose logs -f`

✅ **Problemas?** Veja [QUICK_START.md](./QUICK_START.md) seção Troubleshooting



