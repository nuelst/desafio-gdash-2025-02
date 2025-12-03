# 📖 Sobre o Projeto - Weather Dashboard

## 🎯 Visão Geral

Este projeto foi desenvolvido como parte do **Desafio GDASH 2025/02**, um processo seletivo para desenvolvedores full-stack. O sistema é uma aplicação completa de monitoramento climático que integra múltiplas tecnologias e linguagens de programação.

> 📋 **Documentação do Desafio:** Consulte o [README.md](./README.md) para entender os requisitos completos do desafio.

---

## 🏗️ Arquitetura do Sistema

### Fluxo de Dados

O sistema segue uma arquitetura baseada em **microserviços** e **mensageria**, com o seguinte fluxo:

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Python    │─────▶│   RabbitMQ   │─────▶│  Go Worker  │─────▶│   NestJS    │─────▶│  MongoDB    │
│  Collector  │      │    (Fila)    │      │  (Worker)   │      │    (API)    │      │  (Banco)    │
└─────────────┘      └──────────────┘      └─────────────┘      └─────────────┘      └─────────────┘
                                                                         │
                                                                         ▼
                                                                ┌─────────────┐
                                                                │  Frontend   │
                                                                │   (React)   │
                                                                └─────────────┘
```

### Componentes Principais

1. **Python Collector** (`/collector`)
   - Coleta dados climáticos da API Open-Meteo
   - Publica mensagens na fila RabbitMQ
   - Executa periodicamente (configurável)

2. **RabbitMQ** (Fila de Mensagens)
   - Gerencia a comunicação assíncrona entre serviços
   - Interface de gerenciamento disponível em `http://localhost:15672`

3. **Go Worker** (`/worker`)
   - Consome mensagens da fila RabbitMQ
   - Processa e valida dados
   - Envia dados para a API NestJS
   - Implementa retry em caso de falhas

4. **NestJS API** (`/backend`)
   - Recebe dados do worker Go
   - Armazena dados no MongoDB
   - Gera insights de IA baseados em dados históricos
   - Expõe endpoints REST para o frontend
   - Gerencia autenticação e usuários

5. **MongoDB** (Banco de Dados)
   - Armazena logs climáticos
   - Armazena dados de usuários
   - Persistência via volumes Docker

6. **Frontend React** (`/frontend`)
   - Dashboard interativo com gráficos
   - Visualização de insights de IA
   - CRUD de usuários
   - Exportação de dados (CSV/XLSX)

---

## 🛠️ Stack Tecnológica

### Backend
- **NestJS** (TypeScript) - Framework Node.js
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação
- **Swagger** - Documentação da API
- **ExcelJS** - Geração de arquivos XLSX

### Frontend
- **React 18** - Biblioteca UI
- **Vite** - Build tool
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI
- **Recharts** - Gráficos
- **React Query** - Gerenciamento de estado servidor
- **Zustand** - Gerenciamento de estado cliente
- **Sonner** - Notificações (toasts)
- **Nuqs** - Gerenciamento de query params

### Coleta de Dados
- **Python 3.12** - Linguagem
- **requests** - Cliente HTTP
- **pika** - Cliente RabbitMQ
- **python-dotenv** - Gerenciamento de variáveis

### Worker
- **Go 1.21+** - Linguagem
- **amqp091-go** - Cliente RabbitMQ
- **net/http** - Cliente HTTP

### Infraestrutura
- **Docker** - Containerização
- **Docker Compose** - Orquestração
- **RabbitMQ** - Message Broker

### APIs Externas
- **Open-Meteo** - Dados climáticos

---

## 🚀 Como Executar

> 📖 **Guia Completo:** Para instruções detalhadas de execução, consulte o [HOW_TO_RUN.md](./HOW_TO_RUN.md).

### Início Rápido

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd desafio-gdash-2025-02

# Inicie todos os serviços com Docker Compose
docker compose up -d

# Acesse as aplicações:
# - Frontend: http://localhost:5173
# - API: http://localhost:3000
# - Swagger: http://localhost:3000/api/docs
# - RabbitMQ: http://localhost:15672 (guest/guest)
```

**Login inicial:** Configure via variáveis de ambiente `ADMIN_EMAIL` e `ADMIN_PASSWORD`

Para mais detalhes sobre execução em desenvolvimento, configuração de variáveis de ambiente, troubleshooting e outras opções, consulte o [HOW_TO_RUN.md](./HOW_TO_RUN.md).

---

## 📁 Estrutura do Projeto

```
desafio-gdash-2025-02/
├── backend/              # API NestJS
│   ├── src/
│   │   ├── auth/         # Autenticação JWT
│   │   ├── users/        # CRUD de usuários
│   │   ├── weather/      # Endpoints de clima
│   │   └── shared/       # Código compartilhado
│   └── Dockerfile
│
├── frontend/             # Aplicação React
│   ├── src/
│   │   ├── components/   # Componentes React
│   │   ├── pages/        # Páginas da aplicação
│   │   ├── core/         # API clients, utils
│   │   └── stores/      # Estado global (Zustand)
│   └── Dockerfile
│
├── collector/            # Serviço Python
│   ├── src/
│   │   ├── application/  # Lógica de negócio
│   │   ├── domain/       # Entidades de domínio
│   │   └── infrastructure/ # Clientes externos
│   └── Dockerfile
│
├── worker/               # Worker Go
│   ├── internal/
│   │   ├── application/  # Processamento de mensagens
│   │   ├── domain/       # Modelos de domínio
│   │   └── infrastructure/ # Clientes (RabbitMQ, HTTP)
│   └── Dockerfile
│
├── compose.yml           # Configuração Docker Compose
├── .env.example         # Exemplo de variáveis de ambiente
├── README.md            # Documentação do desafio
└── ABOUT.md             # Este arquivo
```

---

## 🔑 URLs e Credenciais

### URLs Principais

| Serviço | URL | Descrição |
|---------|-----|-----------|
| Frontend | http://localhost:5173 | Interface do usuário |
| API Backend | http://localhost:3000 | API REST |
| Swagger | http://localhost:3000/api/docs | Documentação da API |
| RabbitMQ Management | http://localhost:15672 | Interface de gerenciamento |
| MongoDB | mongodb://localhost:27017 | Conexão direta ao banco |

### Credenciais Padrão

#### Aplicação
- **Email:** Configurado via `ADMIN_EMAIL` (variável de ambiente)
- **Senha:** Configurada via `ADMIN_PASSWORD` (variável de ambiente)
- **Nota:** As credenciais do admin não são expostas publicamente por segurança
- **Role:** `admin`

#### RabbitMQ Management
- **Usuário:** `guest`
- **Senha:** `guest`

---

## 📊 Funcionalidades Implementadas

### ✅ Requisitos Obrigatórios

- [x] Coleta de dados climáticos via Open-Meteo
- [x] Envio de dados para RabbitMQ (Python)
- [x] Worker Go processando mensagens
- [x] API NestJS armazenando dados no MongoDB
- [x] Dashboard com dados reais
- [x] Insights de IA baseados em dados históricos
- [x] CRUD completo de usuários
- [x] Autenticação JWT
- [x] Exportação CSV/XLSX
- [x] Gráficos e visualizações
- [x] Tabela de registros com paginação e filtros
- [x] Docker Compose configurado

### 🎨 Funcionalidades Extras

- [x] Suporte a múltiplas localizações
- [x] Filtro por localização no dashboard
- [x] Página de perfil do usuário
- [x] Sistema de roles (user/admin)
- [x] Toasts com feedback visual
- [x] Componentes shadcn/ui integrados
- [x] Error Boundary
- [x] Validação de formulários
- [x] Responsive design

---

## 🧪 Testes e Qualidade

### Backend
- Estrutura preparada para testes unitários
- Validação de dados com class-validator
- Tratamento de erros centralizado

### Frontend
- TypeScript para type safety
- Validação com Zod
- Error boundaries para captura de erros

---

## 📝 Variáveis de Ambiente

Para configuração detalhada de variáveis de ambiente, consulte o [HOW_TO_RUN.md](./HOW_TO_RUN.md) e os arquivos `.env.example` em cada serviço.

**Principais variáveis por serviço:**

| Serviço | Variáveis Principais |
|---------|---------------------|
| **Backend** | `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`, `GEONAMES_USERNAME` |
| **Frontend** | `VITE_API_URL` |
| **Collector** | `RABBITMQ_URI`, `WEATHER_LOCATIONS`, `COLLECTION_INTERVAL_SECONDS` |
| **Worker** | `RABBITMQ_URI`, `NESTJS_API_URL`, `RETRY_ATTEMPTS` |

> 💡 **Dica:** As variáveis estão pré-configuradas no `compose.yml`. Para desenvolvimento local, consulte os arquivos `.env.example` de cada serviço.

---

## 🔧 Comandos Úteis

Para comandos detalhados de execução, desenvolvimento e troubleshooting, consulte o [HOW_TO_RUN.md](./HOW_TO_RUN.md).

**Comandos básicos Docker Compose:**
```bash
docker compose up -d      # Iniciar serviços
docker compose down        # Parar serviços
docker compose logs -f     # Ver logs
docker compose ps         # Ver status
```

---

## 🐛 Troubleshooting

Para soluções detalhadas de problemas comuns, consulte a seção [Troubleshooting](./HOW_TO_RUN.md#-troubleshooting) no [HOW_TO_RUN.md](./HOW_TO_RUN.md).

**Problemas mais comuns:**
- Porta já em uso
- Container não inicia
- Erro de conexão com MongoDB/RabbitMQ
- Frontend não conecta com API
- Collector/Worker não funcionam

---

## 📚 Documentação Adicional

- [README do Desafio](./README.md) - Requisitos completos do desafio
- [HOW_TO_RUN.md](./HOW_TO_RUN.md) - Guia completo de execução
- [Swagger API Docs](http://localhost:3000/api/docs) - Documentação interativa da API

---

## 👥 Desenvolvimento

Este projeto foi desenvolvido seguindo:
- **Clean Architecture** - Separação de responsabilidades
- **Domain-Driven Design** - Foco no domínio de negócio
- **SOLID Principles** - Princípios de design
- **TypeScript** - Type safety em todo o código
- **Best Practices** - Padrões de código e estrutura

---

## 📄 Licença

Este projeto foi desenvolvido para fins de avaliação técnica no processo seletivo GDASH 2025/02.

---

**Desenvolvido com ❤️ para o desafio GDASH 2025/02**

