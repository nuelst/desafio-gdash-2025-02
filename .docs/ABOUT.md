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

## 🏗️ Arquitetura e Fluxo de Dados

![Arquitetura](./image.png)

O sistema funciona em **3 ciclos principais** que garantem coleta automática e entrega de dados ao usuário:

### 1️⃣ Coleta e Publicação (Automático - A cada hora)

```
Collector (Python) → RabbitMQ → Worker (Go)
```

1. **Collector (Python)**: Busca dados de previsão do tempo na API Open-Meteo
2. **RabbitMQ**: O Collector publica os dados brutos na fila `weather-data`
3. **Worker (Go)**: Consome mensagens da fila com lógica de retry automático

**Vantagem**: Se o Backend cair, os dados continuam sendo coletados e ficam na fila até serem processados.

### 2️⃣ Processamento e Armazenamento

```
Worker (Go) → Backend (NestJS) → MongoDB → Gemini AI
```

1. **Backend (NestJS)**: Recebe dados via POST `/weather/logs` do Worker
2. **MongoDB**: Valida e salva os dados na coleção `weather_logs`
3. **Gemini AI**: Gera insights automáticos baseados nos dados históricos

### 3️⃣ Requisição do Usuário e Visualização

```
Frontend (React) → Backend (NestJS) → APIs Externas
```

1. **Frontend**: Usuário faz login (JWT) e acessa o dashboard
2. **Backend**: Atende requisições GET (`/weather/logs`, `/weather/insights`)
3. **Explorar Cidades**: 
   - Primeiro tenta **Nominatim** (OpenStreetMap - mais rápido)
   - Se falhar, usa **GeoNames** (fallback)
   - Enriquece com dados climáticos do **Open-Meteo**
4. **Visualização**: Frontend exibe gráficos, tabelas e insights de IA

---

## ⚙️ Variáveis de Ambiente

Copie `env.example` para `.env` e configure:

```bash
# Essenciais
MONGODB_URI=mongodb://localhost:27017/weather-dashboard
RABBITMQ_URI=amqp://guest:guest@localhost:5672/
JWT_SECRET=seu-secret-aqui
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin123!

# URLs
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:3000

# APIs Externas (Opcionais)
GEONAMES_USERNAME=demo
GEMINI_API_KEY=your-gemini-api-key  # Para insights com IA
```

---

## 🚀 Como Rodar

### Opção 1: Scripts Automáticos (Recomendado) ⭐

O projeto inclui scripts `.sh` que automatizam todo o processo:

```bash
# 1. Configure variáveis
cp env.example .env
# Edite o .env com suas configurações

# 2. Build das imagens Docker
./build.sh

# 3. Rodar o projeto
./run.sh

# 4. Parar quando terminar
./stop.sh
```

**O que cada script faz:**
- `./build.sh` - Cria todas as imagens Docker (backend, frontend, collector, worker)
- `./run.sh` - Inicia todos os containers e mostra URLs de acesso
- `./stop.sh` - Para todos os containers

### Opção 2: Docker Compose Manual

```bash
cp env.example .env
docker compose up -d --build
```

**Acesse:**
- Frontend: http://localhost:5173
- API: http://localhost:3000
- Swagger: http://localhost:3000/docs
- RabbitMQ: http://localhost:15672 (guest/guest)

### Opção 3: Desenvolvimento (Sem Docker)

#### Backend
```bash
cd backend
npm install
npm run start:dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Collector
```bash
cd collector
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

#### Worker
```bash
cd worker
go mod download
go run main.go
```

---

## 📁 Estrutura do Projeto

```
├── backend/         # API NestJS
├── frontend/        # React + Vite
├── collector/       # Python (coleta dados)
├── worker/          # Go (processa fila)
├── compose.yml      # Docker Compose
├── build.sh         # Script de build
├── run.sh           # Script de execução
├── stop.sh          # Script de parada
└── env.example      # Exemplo de variáveis
```

---

## 🛠️ Stack Tecnológico

- **Backend**: NestJS, MongoDB, JWT
- **Frontend**: React, TailwindCSS, Recharts
- **Microserviços**: Python (Collector), Go (Worker)
- **Mensageria**: RabbitMQ
- **APIs Externas**: Open-Meteo, Nominatim, GeoNames, Google Gemini AI
- **Infraestrutura**: Docker, Railway, Vercel

---

## 🔑 Funcionalidades

- ✅ Autenticação JWT
- ✅ Dashboard interativo com gráficos
- ✅ Insights de IA (Google Gemini)
- ✅ Exportação CSV/XLSX
- ✅ Explorar cidades pelo mundo
- ✅ Coleta automática a cada hora
- ✅ Processamento assíncrono com retry
- ✅ API REST documentada (Swagger)

---

## 🐛 Troubleshooting

### Frontend não conecta na API
- Verifique `VITE_API_URL` no `.env`
- Verifique CORS no backend (`FRONTEND_URL`)

### Collector/Worker não funcionam
- Verifique `RABBITMQ_URI` no `.env`
- Veja logs: `docker compose logs collector worker`

### Insights sempre retorna "generatedBy": "rules"
- Configure `GEMINI_API_KEY` no `.env` para ativar IA
- Obtenha chave grátis: https://aistudio.google.com/app/apikey

---

**Desenvolvido com 💙**
