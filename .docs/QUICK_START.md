# 🚀 Quick Start - Weather Dashboard

Guia rápido para rodar o projeto com Docker.

---

## ⚡ Uso Rápido

### 1️⃣ Configure as Variáveis

```bash
# Copie o arquivo de exemplo
cp env.example .env

# Edite com suas configurações (obrigatório!)
nano .env  # ou use seu editor preferido
```

**Variáveis essenciais para editar:**
- `MONGODB_URI` - String de conexão do MongoDB
- `RABBITMQ_URI` - String de conexão do RabbitMQ
- `JWT_SECRET` - Secret para JWT
- `ADMIN_EMAIL` e `ADMIN_PASSWORD` - Credenciais do admin

**Variáveis opcionais (melhoram a experiência):**
- `GEMINI_API_KEY` - Para insights com IA real (grátis: https://aistudio.google.com/app/apikey) 🆕
- `GEONAMES_USERNAME` - Para buscar cidades (padrão: "demo")

### 2️⃣ Build das Imagens

```bash
./build.sh
```

Este comando vai:
- ✅ Criar imagem do Backend (NestJS)
- ✅ Criar imagem do Frontend (React)
- ✅ Criar imagem do Collector (Python)
- ✅ Criar imagem do Worker (Go)

⏱️ Tempo estimado: 5-10 minutos

### 3️⃣ Rodar o Projeto

```bash
./run.sh
```

Este comando vai:
- ✅ Verificar se as imagens existem
- ✅ Iniciar todos os containers com Docker Compose
- ✅ Mostrar as URLs de acesso

### 4️⃣ Acessar

Aguarde ~30 segundos para os serviços iniciarem, depois acesse:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Swagger**: http://localhost:3000/docs
- **RabbitMQ**: http://localhost:15672 (guest/guest)

**Login padrão:**
- Email: `admin@example.com` (ou o que você configurou)
- Senha: `Admin123!` (ou o que você configurou)

### 5️⃣ Parar o Projeto

```bash
./stop.sh
```

---

## 📋 Comandos Úteis

### Ver logs de todos os serviços
```bash
docker compose logs -f
```

### Ver logs de um serviço específico
```bash
docker compose logs -f api          # Backend
docker compose logs -f frontend     # Frontend
docker compose logs -f worker       # Worker Go
docker compose logs -f collector    # Collector Python
docker compose logs -f mongodb      # MongoDB
docker compose logs -f rabbitmq     # RabbitMQ
```

### Reiniciar um serviço
```bash
docker compose restart api          # Backend
docker compose restart worker       # Worker
docker compose restart collector    # Collector
```

### Rebuild um serviço específico
```bash
docker compose up -d --build api
```

### Ver status dos containers
```bash
docker compose ps
```

### Entrar em um container
```bash
docker compose exec api sh          # Backend
docker compose exec worker sh       # Worker
docker compose exec collector sh    # Collector
```

### Limpar tudo (remover containers e volumes)
```bash
docker compose down -v
```

---

## 🐛 Troubleshooting

### Erro: "Permission denied"
```bash
chmod +x build.sh run.sh stop.sh
```

### Erro: "Docker daemon not running"
- Inicie o Docker Desktop
- Aguarde ele inicializar completamente
- Tente novamente

### Erro: "Port already in use"
Outro serviço está usando a porta. Opções:
1. Pare o outro serviço
2. Mude as portas no `compose.yml`

Portas usadas:
- 3000 (Backend)
- 5173 (Frontend)
- 5672 (RabbitMQ AMQP)
- 15672 (RabbitMQ Management)
- 27017 (MongoDB)

### Erro: "Cannot connect to MongoDB"
- Verifique se o `MONGODB_URI` está correto no `.env`
- Se usar MongoDB local, certifique-se que está rodando
- Se usar MongoDB Atlas, verifique conexão internet

### Frontend não conecta no Backend
- Verifique se o `VITE_API_URL` no `.env` está correto
- Verifique CORS (variável `FRONTEND_URL` no backend)

### Insights sempre retorna "generatedBy": "rules"
- Significa que está usando fallback (regras), não IA
- Para ativar IA real, configure `GEMINI_API_KEY` no `.env`
- Obtenha chave grátis: https://aistudio.google.com/app/apikey
- Guia completo: [backend/GEMINI_SETUP.md](../backend/GEMINI_SETUP.md)

### Collector/Worker não funcionam
- Verifique logs: `docker compose logs collector worker`
- Verifique `RABBITMQ_URI` no `.env`
- Acesse RabbitMQ Management: http://localhost:15672

---

## 🔄 Fluxo Completo

```
1. cp env.example .env
2. Editar .env com suas configurações
3. ./build.sh (primeira vez)
4. ./run.sh
5. Acessar http://localhost:5173
6. Fazer login
7. Ver dados no dashboard
8. ./stop.sh (quando terminar)
```

---

## ⚙️ Desenvolvimento

### Rodar em modo desenvolvimento (sem Docker)

Veja [ABOUT.md](./ABOUT.md) para instruções de desenvolvimento.

### Rebuild após mudanças no código

```bash
./stop.sh
./build.sh
./run.sh
```

Ou rebuild apenas o que mudou:
```bash
docker compose up -d --build api    # Se mudou backend
```

---

## 🤖 Configurar IA (Opcional mas Recomendado)

O projeto usa **Google Gemini AI** para gerar insights climáticos inteligentes.

### Obter API Key (Grátis):
1. Acesse: https://aistudio.google.com/app/apikey
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave (começa com `AIza...`)

### Adicionar no `.env`:
```bash
GEMINI_API_KEY=AIzaSy...sua-chave-aqui...
```

### Reiniciar:
```bash
./stop.sh
./run.sh
```

**Limites grátis:**
- ✅ 60 requests/minuto
- ✅ 1.500 requests/dia
- ✅ Totalmente grátis
- ✅ Sem cartão de crédito

**Guia completo:** [backend/GEMINI_SETUP.md](../backend/GEMINI_SETUP.md)

---

## 📚 Mais Informações

- [ABOUT.md](./ABOUT.md) - Documentação completa
- [README.md](../README.md) - Requisitos do projeto
- [env.example](../env.example) - Exemplo de variáveis
- [GEMINI_SETUP.md](../backend/GEMINI_SETUP.md) - Configurar IA 🆕

---

## 💡 Dicas

✅ **Primeira execução**: Use `./build.sh` antes de `./run.sh`

✅ **Mudou código**: Precisa fazer `./build.sh` novamente

✅ **Só mudou .env**: Basta fazer `./run.sh` (ou `docker compose restart`)

✅ **Quer limpar tudo**: `docker compose down -v && ./build.sh && ./run.sh`

✅ **Ver o que está rodando**: `docker compose ps`

---

**Aproveite! 🎉**

