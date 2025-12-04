# Deploy na Railway - Instruções

## Problema Atual
A Railway não está respeitando o Root Directory quando configurado pela interface web.

## Solução 1: Configuração Manual na Interface

1. **Delete o serviço atual**
2. Crie um novo serviço:
   - Clique em "+ New Service"
   - Selecione "GitHub Repo"
   - Escolha o repositório
   - **IMPORTANTE**: No campo "Root Directory", digite: `backend`
   - Branch: `manuel-santos`

## Solução 2: Deploy via Railway CLI

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Criar projeto (se não existir)
railway init

# Entrar no diretório do backend
cd backend

# Link com o projeto Railway
railway link

# Adicionar variáveis de ambiente
railway variables set MONGODB_URI="mongodb+srv://..."
railway variables set JWT_SECRET="p0YSgN4qQX44QBrtQ/uLB5isAdWFP3uIH/NKsoQfUhs="
railway variables set JWT_EXPIRES_IN="24h"
railway variables set ADMIN_EMAIL="admin@example.com"
railway variables set ADMIN_PASSWORD="Admin123!"
railway variables set FRONTEND_URL="https://gdash-weather.vercel.app"
railway variables set GEONAMES_USERNAME="demo"
railway variables set NODE_ENV="production"

# Deploy!
railway up
```

## Solução 3: Criar Serviços Separados

Se nada funcionar, crie um repositório separado para cada serviço:

1. Backend: novo repo com apenas a pasta `backend/`
2. Frontend: novo repo com apenas a pasta `frontend/`
3. Etc.

## Variáveis de Ambiente Necessárias

### Backend
```bash
MONGODB_URI=mongodb+srv://seu-usuario:sua-senha@cluster.xxxxx.mongodb.net/weather-dashboard?retryWrites=true&w=majority
JWT_SECRET=p0YSgN4qQX44QBrtQ/uLB5isAdWFP3uIH/NKsoQfUhs=
JWT_EXPIRES_IN=24h
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin123!
FRONTEND_URL=https://gdash-weather.vercel.app
GEONAMES_USERNAME=demo
NODE_ENV=production
```

### Frontend
```bash
VITE_API_URL=https://seu-backend.railway.app/api
```

### Collector
```bash
MONGODB_URI=mongodb+srv://...
OPENWEATHER_API_KEY=sua-chave
NODE_ENV=production
```

### Worker
```bash
MONGODB_URI=mongodb+srv://...
NODE_ENV=production
```

## Estrutura de Arquivos Atual

Cada serviço agora tem:
- `backend/Dockerfile` ✅
- `backend/railway.toml` ✅
- `backend/.dockerignore` ✅
- (mesmo para frontend, collector, worker)

## Verificação

Depois de configurar o Root Directory, os logs devem mostrar:
```
✅ root_dir=backend
✅ found 'Dockerfile' at 'backend/Dockerfile'
```

E NÃO:
```
❌ root_dir=
❌ skipping 'Dockerfile' at 'backend/Dockerfile'
```

