FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files - funciona com contexto na raiz
COPY frontend/package*.json ./
RUN npm ci

# Copiar código fonte
COPY frontend/ .

# Build-time arguments para variáveis de ambiente
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

