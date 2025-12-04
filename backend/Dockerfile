FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files - funciona tanto com root directory quanto sem
COPY backend/package*.json ./
RUN npm ci

# Copiar código fonte
COPY backend/ .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

# Copiar package files para produção
COPY backend/package*.json ./
RUN npm ci --only=production

# Copiar build da stage anterior
COPY --from=builder /app/dist ./dist

CMD ["node", "dist/main"]

