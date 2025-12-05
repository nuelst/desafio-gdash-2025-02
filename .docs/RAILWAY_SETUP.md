# 🚀 Guia de Deploy na Railway - Serviços Separados

Este guia mostra como fazer deploy de cada serviço separadamente na Railway.

## 📋 Pré-requisitos

1. Conta na Railway: https://railway.app
2. MongoDB Atlas ou outro MongoDB na nuvem
3. RabbitMQ na nuvem (CloudAMQP recomendado: https://www.cloudamqp.com/)

---

## 1️⃣ Serviço: Backend (NestJS API)

### Criar Serviço:
1. No Dashboard da Railway → **"+ New Service"**
2. Selecione **"GitHub Repo"**
3. Escolha: `desafio-gdash-2025-02`
4. Branch: `manuel-santos`

### Configurar Dockerfile:
- A Railway vai detectar automaticamente `backend/Dockerfile`
- **NÃO precisa** configurar Root Directory (o Dockerfile já está ajustado)

### Variáveis de Ambiente:

```bash
# MongoDB (obrigatório!)
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/weather-dashboard?retryWrites=true&w=majority

# JWT
JWT_SECRET=p0YSgN4qQX44QBrtQ/uLB5isAdWFP3uIH/NKsoQfUhs=
JWT_EXPIRES_IN=24h

# Admin User
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin123!

# Frontend URL (para CORS)
FRONTEND_URL=https://gdash-weather.vercel.app

# GeoNames API
GEONAMES_USERNAME=demo

# Ambiente
NODE_ENV=production
```

### Após Deploy:
- Anote a URL gerada: `https://seu-backend.up.railway.app`
- Teste o Swagger: `https://seu-backend.up.railway.app/docs`

---

## 2️⃣ Serviço: Collector (Python)

### Criar Serviço:
1. No Dashboard da Railway → **"+ New Service"**
2. Selecione **"GitHub Repo"**
3. Escolha: `desafio-gdash-2025-02`
4. Branch: `manuel-santos`

### Configurar Dockerfile:
- A Railway vai detectar automaticamente `collector/Dockerfile`

### Variáveis de Ambiente:

```bash
# RabbitMQ (obrigatório!)
RABBITMQ_URI=amqp://usuario:senha@seu-rabbitmq.cloudamqp.com/vhost

# Queue
RABBITMQ_QUEUE=weather-data

# Localizações para coletar dados (JSON)
WEATHER_LOCATIONS=[{"name":"São Paulo, BR","latitude":-23.5505,"longitude":-46.6333},{"name":"Luanda, Angola","latitude":-8.8383,"longitude":13.2344}]

# Intervalo de coleta (em segundos) - 3600 = 1 hora
COLLECTION_INTERVAL_SECONDS=3600

# API Open-Meteo
OPEN_METEO_URL=https://api.open-meteo.com/v1/forecast

# Ambiente
NODE_ENV=production
```

### Notas:
- O Collector roda continuamente coletando dados a cada intervalo
- Ele publica mensagens no RabbitMQ que serão processadas pelo Worker
- Não expõe porta HTTP

---

## 3️⃣ Serviço: Worker (Go)

### Criar Serviço:
1. No Dashboard da Railway → **"+ New Service"**
2. Selecione **"GitHub Repo"**
3. Escolha: `desafio-gdash-2025-02`
4. Branch: `manuel-santos`

### Configurar Dockerfile:
- A Railway vai detectar automaticamente `worker/Dockerfile`

### Variáveis de Ambiente:

```bash
# RabbitMQ (mesmo do Collector!)
RABBITMQ_URI=amqp://usuario:senha@seu-rabbitmq.cloudamqp.com/vhost

# Queue (mesma do Collector!)
RABBITMQ_QUEUE=weather-data

# URL da API NestJS (use a URL do serviço Backend)
NESTJS_API_URL=https://seu-backend.up.railway.app

# Retry
RETRY_ATTEMPTS=3
RETRY_DELAY=5

# Ambiente
NODE_ENV=production
```

### Notas:
- O Worker consome mensagens do RabbitMQ
- Processa os dados e envia para a API NestJS
- Não expõe porta HTTP

---

## 4️⃣ Serviço: Frontend (React + Vite) - OPCIONAL

Se quiser hospedar o frontend na Railway também (além da Vercel):

### Criar Serviço:
1. No Dashboard da Railway → **"+ New Service"**
2. Selecione **"GitHub Repo"**
3. Escolha: `desafio-gdash-2025-02`
4. Branch: `manuel-santos`

### Variáveis de Ambiente:

```bash
# URL da API (use a URL do Backend)
VITE_API_URL=https://seu-backend.up.railway.app
```

---

## 🔗 Ordem de Deploy Recomendada

1. **Backend** (API) - Primeiro, pois outros serviços dependem dele
2. **Collector** (Python) - Coleta dados e publica no RabbitMQ
3. **Worker** (Go) - Consome do RabbitMQ e envia para a API
4. **Frontend** (opcional) - Se não usar Vercel

---

## 🗄️ Serviços Externos Necessários

### MongoDB Atlas (Gratuito)
1. Crie conta: https://www.mongodb.com/cloud/atlas
2. Crie cluster gratuito (M0)
3. Configure acesso de qualquer IP: `0.0.0.0/0`
4. Copie a connection string

### CloudAMQP (RabbitMQ - Gratuito)
1. Crie conta: https://www.cloudamqp.com/
2. Crie instância gratuita (Little Lemur)
3. Copie a AMQP URL
4. Use a mesma URL no Collector e Worker

---

## ✅ Checklist de Deploy

### Backend:
- [ ] Serviço criado na Railway
- [ ] Variáveis de ambiente configuradas
- [ ] Build bem-sucedido
- [ ] URL gerada e funcionando
- [ ] Swagger acessível em `/docs`
- [ ] MongoDB conectado

### Collector:
- [ ] Serviço criado na Railway
- [ ] Variáveis de ambiente configuradas
- [ ] Build bem-sucedido
- [ ] RabbitMQ conectado
- [ ] Logs mostram coleta de dados

### Worker:
- [ ] Serviço criado na Railway
- [ ] Variáveis de ambiente configuradas
- [ ] Build bem-sucedido
- [ ] RabbitMQ conectado
- [ ] API conectada
- [ ] Logs mostram processamento de mensagens

### Frontend (Vercel):
- [ ] `VITE_API_URL` configurada
- [ ] Redeploy realizado
- [ ] Login funcionando
- [ ] Dashboard carregando dados

---

## 🐛 Troubleshooting

### Backend não conecta ao MongoDB
- Verifique se o IP `0.0.0.0/0` está liberado no MongoDB Atlas
- Verifique a connection string (usuário, senha, cluster)

### Collector/Worker não conecta ao RabbitMQ
- Verifique se a URL do RabbitMQ está correta
- Verifique se a queue existe (será criada automaticamente)

### Worker não envia dados para API
- Verifique se `NESTJS_API_URL` está correto
- Verifique logs do Worker para erros
- Teste a API manualmente: `curl https://seu-backend.up.railway.app/weather`

### Frontend não conecta ao Backend
- Verifique CORS no backend (variável `FRONTEND_URL`)
- Verifique se `VITE_API_URL` está correto no Vercel
- Abra DevTools → Network para ver erros

---

## 📚 URLs Úteis

- **Railway Dashboard**: https://railway.app/dashboard
- **MongoDB Atlas**: https://cloud.mongodb.com/
- **CloudAMQP**: https://customer.cloudamqp.com/
- **Vercel Dashboard**: https://vercel.com/dashboard

---

## 💡 Dicas

1. **Logs**: Use os logs da Railway para debugar problemas
2. **Restart**: Às vezes é necessário reiniciar os serviços após mudar variáveis
3. **Health Check**: O Backend expõe `/health` para verificar status
4. **Swagger**: Use `/docs` para testar a API manualmente
5. **Ordem**: Sempre faça deploy do Backend primeiro!

---

## 🎯 Resultado Final

Após configurar tudo:

```
┌─────────────────────────────────────────┐
│  Frontend (Vercel)                      │
│  https://gdash-weather.vercel.app       │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Backend API (Railway)                  │
│  https://seu-backend.up.railway.app     │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  MongoDB Atlas                          │
│  (Armazena dados de clima e usuários)  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Collector (Railway)                    │
│  Coleta dados a cada 1 hora             │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  RabbitMQ (CloudAMQP)                   │
│  Queue: weather-data                    │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Worker (Railway)                       │
│  Processa e envia para API              │
└─────────────────────────────────────────┘
```
