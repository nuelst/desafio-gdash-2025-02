# 🏗️ Arquitetura do Weather Dashboard

## 📊 Visão Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER (Browser)                           │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 │ HTTPS
                                 ▼
                    ┌────────────────────────┐
                    │   Frontend (React)     │
                    │   Vercel               │
                    │   - Dashboard UI       │
                    │   - Gráficos           │
                    │   - Autenticação       │
                    └────────────┬───────────┘
                                 │
                                 │ REST API (HTTPS)
                                 ▼
                    ┌────────────────────────┐
                    │   Backend (NestJS)     │
                    │   Railway              │
                    │   - Auth JWT           │
                    │   - Business Logic     │
                    │   - Insights IA        │
                    │   - Export CSV/XLSX    │
                    │   - Explore Cities     │
                    └─────┬──────┬───────┬──────┬────┘
                          │      │       │      │
          ┌───────────────┘      │       │      └─────────────┐
          │                      │       │                    │
          │ Mongoose             │ HTTP  │ HTTP POST          │ HTTP
          ▼                      ▼       ▼                    ▼
┌──────────────────┐   ┌─────────────┐ ┌──────────┐  ┌─────────────┐
│  MongoDB Atlas   │   │ GeoNames    │ │ Worker   │  │ Gemini API  │
│                  │   │ API         │ │ (Go)     │  │ (Google AI) │
│                  │                         │  Railway        │
│  Collections:    │                         │  - Consume      │
│  - users         │                         │  - Process      │
│  - weather_logs  │                         │  - Retry        │
│  - insights      │                         └────────┬────────┘
└──────────────────┘                                  │
                                                      │ AMQP
                                                      │ (consume)
                                                      ▼
                                            ┌─────────────────┐
                                            │  RabbitMQ       │
                                            │  CloudAMQP      │
                                            │                 │
                                            │  Queue:         │
                                            │  weather-data   │
                                            └────────┬────────┘
                                                     │
                                                     │ AMQP
                                                     │ (publish)
                                                     ▼
                                            ┌─────────────────┐
                                            │ Collector (Py)  │
                                            │ Railway         │
                                            │ - Scheduled     │
                                            │ - Fetch Weather │
                                            └────────┬────────┘
                                                     │
                                                     │ HTTPS
                                                     ▼
                                            ┌─────────────────┐
                                            │ Open-Meteo API  │
                                            │ (External)      │
                                            └─────────────────┘
```

---

## 🔄 Fluxo de Dados Detalhado

### 1️⃣ Coleta de Dados (Python Collector)

```
┌─────────────────┐
│  Scheduler      │  A cada 1 hora (3600s)
│  (time.sleep)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Weather API    │  GET https://api.open-meteo.com/v1/forecast
│  Client         │  Params: latitude, longitude, hourly data
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Data Mapper    │  Transforma resposta em WeatherData
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  RabbitMQ       │  Publica mensagem JSON na fila
│  Publisher      │  Queue: weather-data
└─────────────────┘
```

### 2️⃣ Processamento (Go Worker)

```
┌─────────────────┐
│  RabbitMQ       │  Consome mensagens da fila
│  Consumer       │  Auto-ack: false (manual)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Message        │  Valida JSON e transforma
│  Processor      │  em WeatherLogRequest
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  HTTP Client    │  POST /weather/logs
│  with Retry     │  Max 3 tentativas
└────────┬────────┘
         │
    ┌────┴────┐
    │ Success?│
    └────┬────┘
         │
    ┌────┴────────┐
    │             │
   Yes           No
    │             │
    ▼             ▼
  ACK          NACK
(remove)    (retry/DLQ)
```

### 3️⃣ API Backend (NestJS)

#### Endpoints de Weather

```
┌─────────────────┐
│  Controller     │  POST /weather/logs
│  @Post()        │  @Body() CreateWeatherLogDto
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Use Case       │  CreateWeatherLogUseCase.execute()
│  (Application)  │  Business logic
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Entity         │  WeatherLog.create()
│  (Domain)       │  Domain validations
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Repository     │  WeatherLogRepository.save()
│  (Infrastructure)│ MongoDB operations
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  MongoDB        │  db.weather_logs.insertOne()
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  IA Insights    │  Gera insights automáticos
│  Generator      │  baseado em dados históricos
      └─────────────────┘
```

#### Endpoints de Insights (IA)

```
┌─────────────────┐
│  Controller     │  GET /weather/insights
│  @Get()         │  @Query() location?
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Use Case       │  GenerateAIInsightsUseCase.execute()
│  (Application)  │
└────────┬────────┘
         │
    ┌────┴─────────┐
    │ TEM API KEY? │
    └────┬─────────┘
         │
    ┌────┴─────┐
    │          │
   SIM        NÃO
    │          │
    ▼          ▼
┌─────────┐ ┌──────────┐
│ Gemini  │ │ Regras   │
│  API    │ │ (Fallback)│
└────┬────┘ └────┬─────┘
     │           │
     └─────┬─────┘
           │
           ▼
    ┌─────────────┐
    │ Retorna     │
    │ insights    │
    │ em texto    │
    │ natural     │
    └─────────────┘
```

**Exemplo de resposta:**
```json
{
  "insights": "O clima está agradável! Com 25°C de média, perfeito para atividades ao ar livre. Leve água e protetor solar!",
  "generatedBy": "ai",
  "dataPoints": 72
}
```

#### Endpoints de Explore (Cidades)

```
┌─────────────────┐
│  Controller     │  GET /explore/cities?search=London
│  @Get()         │  @Query() SearchCitiesDto
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Use Case       │  SearchCitiesUseCase.execute()
│  (Application)  │  Business logic
└────────┬────────┘
         │
    ┌────┴────┐
    │ Strategy│
    └────┬────┘
         │
    ┌────┴────────────┐
    │                 │
  Try 1             Try 2
    │                 │
    ▼                 ▼
┌──────────┐    ┌──────────┐
│ GeoNames │    │Open-Meteo│
│   API    │    │   API    │
└────┬─────┘    └────┬─────┘
     │               │
     └───────┬───────┘
             │
             ▼
      ┌─────────────┐
      │ Weather API │  Busca dados climáticos
      │ Client      │  para a cidade
      └─────────────┘
```

### 4️⃣ Frontend (React)

```
┌─────────────────┐
│  Login Page     │  POST /auth/login
│                 │  Recebe JWT token
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Auth Store     │  Salva token + user data
│  (Zustand)      │  Persiste em localStorage
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Dashboard      │  GET /weather/logs?page=1&limit=100
│  Page           │  Headers: Authorization: Bearer <token>
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Components     │  - Cards (temp, humidity, wind)
│                 │  - Charts (Recharts)
│                 │  - Tables (logs history)
└─────────────────┘
```

### 5️⃣ Geração de Insights com IA

```
┌─────────────────┐
│  User Request   │  GET /weather/insights
│  (Frontend)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend API    │  GenerateAIInsightsUseCase.execute()
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Busca Dados    │  MongoDB.find({ limit: 100 })
│  Históricos     │  Últimas 100 leituras
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Calcula        │  - Temperaturas médias
│  Estatísticas   │  - Umidades médias
│                 │  - Tendências (subindo/caindo)
└────────┬────────┘
         │
    ┌────┴─────────┐
    │ TEM API KEY? │
    └────┬─────────┘
         │
    ┌────┴─────┐
    │          │
   SIM        NÃO
    │          │
    ▼          ▼
┌──────────┐ ┌──────────┐
│ Gemini   │ │ Regras   │
│  API     │ │ (Fallback)│
│          │ │          │
│ Envia    │ │ Template │
│ prompt   │ │ de texto │
│ com      │ │ fixo     │
│ dados    │ │          │
│          │ │          │
│ Recebe   │ │          │
│ texto    │ │          │
│ natural  │ │          │
└────┬─────┘ └────┬─────┘
     │            │
     └──────┬─────┘
            │
            ▼
   ┌─────────────────┐
   │ Retorna para    │
   │ Frontend:       │
   │                 │
   │ {               │
   │   insights: "O clima está agradável! Com 25°C...",
   │   generatedBy: "ai" ou "rules",
   │   dataPoints: 72
   │ }               │
   └─────────────────┘
```

**APIs de IA usadas:**
- **Google Gemini** (gemini-pro)
- **Totalmente grátis** (60 req/min, 1.500/dia)
- **Fallback automático** se não configurada
- **Configuração:** https://aistudio.google.com/app/apikey

---

## 🛠️ Tecnologias por Camada

### Apresentação
- **React 18** - UI Framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Recharts** - Gráficos
- **Zustand** - State management
- **React Router** - Navegação

### Backend API
- **NestJS** - Framework
- **TypeScript** - Language
- **Mongoose** - ODM
- **JWT** - Auth
- **Class Validator** - Validação
- **Swagger** - Documentação
- **Axios** - HTTP Client (APIs externas)
- **Google Generative AI** - Gemini para insights 🆕

### Worker & Collector
- **Go 1.21** - Worker language
- **Python 3.11** - Collector language
- **amqp091-go** - RabbitMQ client (Go)
- **pika** - RabbitMQ client (Python)
- **requests** - HTTP client (Python)

### APIs Externas
- **Open-Meteo API** - Dados climáticos gratuitos (sem API key)
- **GeoNames API** - Informações geográficas de cidades (username grátis)
- **Google Gemini AI** - Geração de insights com IA real (API key grátis) 🆕
- **Google Gemini AI** - Geração de insights com IA real 🆕

### Infraestrutura
- **Docker** - Containers
- **Docker Compose** - Orquestração local
- **Railway** - Deploy (API, Worker, Collector)
- **Vercel** - Deploy (Frontend)
- **MongoDB Atlas** - Database
- **CloudAMQP** - Message broker

---

## 📦 Estrutura de Módulos

### Backend (NestJS)

```
backend/src/
├── auth/                    # Módulo de autenticação
│   ├── strategies/          # JWT, Local
│   ├── guards/              # Auth guards
│   └── dto/                 # Login DTOs
│
├── users/                   # Módulo de usuários
│   ├── application/         # Use cases
│   ├── domain/              # Entities, Events, Repositories
│   ├── infrastructure/      # MongoDB implementation
│   └── schemas/             # Mongoose schemas
│
├── weather/                 # Módulo de clima
│   ├── application/         # Use cases
│   ├── domain/              # Entities, Events, Repositories
│   ├── infrastructure/      # MongoDB implementation
│   └── schemas/             # Mongoose schemas
│
├── explore/                 # Módulo de exploração
│   ├── application/         # Use cases
│   ├── domain/              # Entities
│   └── infrastructure/      # GeoNames, Open-Meteo clients
│
└── shared/                  # Código compartilhado
    ├── domain/              # Base classes
    ├── swagger/             # Swagger config
    └── app/                 # App ports
```

### Frontend (React)

```
frontend/src/
├── components/              # Componentes reutilizáveis
│   ├── ui/                  # Componentes base (shadcn)
│   ├── layout/              # Layout components
│   └── weather/             # Weather-specific
│
├── pages/                   # Páginas
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── History.tsx
│   └── Explore.tsx
│
├── core/                    # Core logic
│   ├── api/                 # API clients
│   ├── config/              # Configurações
│   └── types/               # TypeScript types
│
├── stores/                  # Zustand stores
│   ├── auth.store.ts
│   └── weather.store.ts
│
└── hooks/                   # Custom hooks
```

---

## 🔐 Segurança

### Autenticação e Autorização
- **JWT Bearer Token** - Stateless auth
- **Password Hashing** - bcrypt (salt rounds: 10)
- **Token Expiration** - 24h padrão
- **CORS** - Configurado para frontend específico
- **HTTPS** - Obrigatório em produção

### Validação
- **DTOs** - class-validator
- **Input Sanitization** - Automático pelo NestJS
- **Environment Variables** - Nunca commitadas

---

## 📈 Escalabilidade

### Horizontal Scaling
- **Stateless Services** - Fácil adicionar mais instâncias
- **Message Queue** - Desacopla serviços
- **Database Indexes** - MongoDB otimizado

### Vertical Scaling
- **Async/Await** - Non-blocking I/O
- **Connection Pooling** - MongoDB e RabbitMQ
- **Retry Logic** - Worker resiliente

---

## 🔄 Padrões de Design

### Backend
- **Clean Architecture** - Separação de camadas
- **Domain-Driven Design** - Lógica de negócio no domínio
- **Repository Pattern** - Abstração de dados
- **Use Case Pattern** - Casos de uso isolados
- **Factory Pattern** - Criação de entidades
- **Event-Driven** - Domain events

### Frontend
- **Container/Presenter** - Separação de lógica e UI
- **Custom Hooks** - Lógica reutilizável
- **Atomic Design** - Componentes modulares

---

## 📊 Monitoramento

### Logs
- **Railway Logs** - Todos os serviços
- **Console Logs** - Estruturados por serviço
- **Error Tracking** - Stack traces completos

### Métricas
- **RabbitMQ Dashboard** - Mensagens/s, Queue depth
- **MongoDB Atlas** - Queries, Connections
- **Vercel Analytics** - Frontend performance

---

## 🚀 Deploy Pipeline

```
┌──────────────┐
│  Git Push    │
│  (GitHub)    │
└──────┬───────┘
       │
       ├─────────────────┬─────────────────┬─────────────────┐
       │                 │                 │                 │
       ▼                 ▼                 ▼                 ▼
┌──────────┐      ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Vercel   │      │ Railway  │    │ Railway  │    │ Railway  │
│ (Front)  │      │ (Backend)│    │ (Worker) │    │(Collect) │
└────┬─────┘      └────┬─────┘    └────┬─────┘    └────┬─────┘
     │                 │                │                │
     ▼                 ▼                ▼                ▼
┌──────────┐      ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Build   │      │  Build   │    │  Build   │    │  Build   │
│  (Vite)  │      │ (NestJS) │    │   (Go)   │    │ (Python) │
└────┬─────┘      └────┬─────┘    └────┬─────┘    └────┬─────┘
     │                 │                │                │
     ▼                 ▼                ▼                ▼
┌──────────┐      ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Deploy  │      │  Deploy  │    │  Deploy  │    │  Deploy  │
│   Live   │      │   Live   │    │   Live   │    │   Live   │
└──────────┘      └──────────┘    └──────────┘    └──────────┘
```

**Tempo médio de deploy:** 2-5 minutos
**Zero downtime:** Sim (Railway e Vercel)
**Rollback:** Automático em caso de falha

