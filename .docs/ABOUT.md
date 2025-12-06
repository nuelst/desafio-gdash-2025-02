# 🌤️ Weather Dashboard

Sistema de monitoramento climático em tempo real com arquitetura de microserviços.

---

## 🌐 URLs de Produção

- **Frontend**: https://gdash-weather.vercel.app
- **Backend API**: https://api-gdash-weather.up.railway.app
- **Swagger**: https://api-gdash-weather.up.railway.app/docs

**Credenciais de teste:**
- Email: `admin@example.com`
- Senha: `Admin123!`

---

## 🏗️ Arquitetura

```
Frontend (React)    →    Backend (NestJS)    →    MongoDB
     ↑                         ↑
     |                         |
     └─── JWT Auth ────────────┘
                               ↓
                        GeoNames API
                     (buscar cidades)
     
Collector (Python) → RabbitMQ → Worker (Go) → Backend
     ↓
Open-Meteo API
(dados climáticos)
```

O sistema coleta dados climáticos a cada hora, processa através de uma fila de mensagens, armazena no banco e gera insights automáticos. A funcionalidade "Explorar" usa a API GeoNames para buscar cidades pelo mundo.

**Veja arquitetura detalhada:** [Diagrama completo](ARCHITECTURE.md)

---

## ⚙️ Variáveis de Ambiente

Copie `env.example` para `.env` e configure:

### Essenciais

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/weather-dashboard

# JWT
JWT_SECRET=seu-secret-aqui
JWT_EXPIRES_IN=24h

# Admin User
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin123!

# URLs
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:3000

# APIs Externas
GEONAMES_USERNAME=demo
GEMINI_API_KEY=your-gemini-api-key

# RabbitMQ
RABBITMQ_URI=amqp://guest:guest@localhost:5672/
RABBITMQ_QUEUE=weather-data
```

---

## 🚀 Rodar em Desenvolvimento

### Opção 1: Scripts Automáticos (Mais Fácil) ⭐

```bash
# 1. Configure variáveis
cp env.example .env
# Edite o .env com suas configurações

# 2. Build das imagens
./build.sh

# 3. Rodar o projeto
./run.sh

# 4. Parar quando terminar
./stop.sh
```

**Veja guia completo:** [QUICK_START.md](.docs/QUICK_START.md)

### Opção 2: Docker Compose Manual

```bash
# Configure as variáveis
cp env.example .env

# Build e inicie todos os serviços
docker compose up -d --build

# Acesse:
# - Frontend: http://localhost:5173
# - API: http://localhost:3000
# - Swagger: http://localhost:3000/docs
# - RabbitMQ: http://localhost:15672 (guest/guest)
```

### Opção 3: Rodar Separadamente (Desenvolvimento Avançado)

#### Backend (NestJS)
```bash
cd backend
npm install
npm run start:dev
```

#### Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

#### Collector (Python)
```bash
cd collector
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

#### Worker (Go)
```bash
cd worker
go mod download
go run main.go
```

---

## 🐳 Build com Docker

### Build Individual

```bash
# Backend
docker build -t weather-backend -f backend/Dockerfile .

# Frontend
docker build -t weather-frontend -f frontend/Dockerfile .

# Collector
docker build -t weather-collector -f collector/Dockerfile .

# Worker
docker build -t weather-worker -f worker/Dockerfile .
```

### Rodar Container Individual

```bash
# Exemplo: Backend
docker run -p 3000:3000 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/weather-dashboard \
  -e JWT_SECRET=secret \
  weather-backend
```

---

## 📁 Estrutura do Projeto

```
├── backend/         # API NestJS
├── frontend/        # React + Vite
├── collector/       # Python (coleta dados)
├── worker/          # Go (processa fila)
├── compose.yml      # Docker Compose
└── env.example      # Exemplo de variáveis
```

---

## 🛠️ Stack Tecnológico

### Backend
- NestJS + TypeScript
- MongoDB + Mongoose
- JWT Authentication
- Clean Architecture

### Frontend
- React + Vite
- TailwindCSS
- Recharts (gráficos)
- Zustand (estado)

### Microserviços
- Python 3.11 (Collector)
- Go 1.21 (Worker)
- RabbitMQ (Mensageria)

### APIs Externas
- Open-Meteo API (dados climáticos)
- GeoNames API (buscar cidades)
- Google Gemini AI (insights inteligentes) 🆕

### Infraestrutura
- Docker + Docker Compose
- Railway (Backend, Worker, Collector)
- Vercel (Frontend)
- MongoDB Atlas
- CloudAMQP

---

## 🔑 Funcionalidades

### ✅ Implementadas

- **Autenticação JWT** - Login seguro
- **Dashboard Interativo** - Visualização de dados
- **Gráficos em Tempo Real** - Temperatura, umidade, vento
- **Histórico Completo** - Todos os registros climáticos
- **Insights de IA** - Análises com Google Gemini (texto natural)
- **Exportação** - CSV e XLSX
- **Explorar Cidades** - Buscar clima em qualquer cidade
- **Coleta Automática** - Dados a cada hora
- **Processamento Assíncrono** - Fila com retry
- **API REST Documentada** - Swagger interativo
- **Gerenciamento de Usuários** - CRUD completo

### 📊 Dados Coletados

- Temperatura (°C)
- Sensação Térmica (°C)
- Umidade (%)
- Velocidade do Vento (km/h)
- Precipitação (mm)
- Condição do Tempo
- Timestamp

---

## 📚 Documentação Adicional

- **Requisitos**: [README.md](../README.md)
- **Arquitetura**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **Configurar Gemini AI**: [backend/GEMINI_SETUP.md](../backend/GEMINI_SETUP.md) 🆕

---

## 🐛 Troubleshooting

### Frontend não conecta na API
- Verifique `VITE_API_URL` no `.env`
- Verifique CORS no backend (`FRONTEND_URL`)

### Collector não envia mensagens
- Verifique `RABBITMQ_URI`
- Veja logs: `docker compose logs collector`

### Worker não processa
- Verifique `RABBITMQ_URI` e `NESTJS_API_URL`
- Veja logs: `docker compose logs worker`

### Erro de autenticação
- Verifique `JWT_SECRET` (deve ser o mesmo em todos os lugares)
- Token pode ter expirado (24h padrão)

---

## 📝 Padrões de Desenvolvimento

### Backend
- Clean Architecture
- Domain-Driven Design
- SOLID Principles
- Repository Pattern
- Use Cases

### Frontend
- Component-Based
- Custom Hooks
- Typed (TypeScript)
- Responsive Design

---

## 🚀 Deploy em Produção

### Railway (Backend, Worker, Collector)
1. Crie serviço no Railway
2. Conecte ao GitHub
3. Configure variáveis de ambiente
4. Deploy automático a cada push

### Vercel (Frontend)
1. Import do GitHub
2. Configure `VITE_API_URL`
3. Deploy automático

**Guia completo:** [.docs/RAILWAY_SETUP.md](.docs/RAILWAY_SETUP.md)

---

## 📄 Licença

MIT License - veja [LICENSE](./LICENSE)

---

**Desenvolvido com 💙 usando tecnologias modernas**
