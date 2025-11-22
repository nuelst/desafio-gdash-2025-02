import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Weather Dashboard API')
  .setDescription(
    `
# Weather Dashboard API

API RESTful para o sistema de dashboard climático que coleta, processa e exibe dados meteorológicos em tempo real.

## Funcionalidades

- 📊 Coleta e armazenamento de dados climáticos
- 🤖 Geração de insights de IA baseados em dados históricos
- 👥 Gerenciamento de usuários e autenticação
- 📥 Exportação de dados em CSV e XLSX
- 🔐 Autenticação JWT

## Autenticação

A maioria dos endpoints requer autenticação via JWT Bearer Token. Para obter um token:

1. Faça login em \`POST /api/auth/login\`
2. Use o token retornado no header: \`Authorization: Bearer <token>\`

## Fluxo de Dados

1. **Python Collector** → Coleta dados da API Open-Meteo
2. **RabbitMQ** → Fila de mensagens
3. **Go Worker** → Processa e envia para a API
4. **NestJS API** → Armazena no MongoDB
5. **Frontend** → Consome a API e exibe no dashboard
  `,
  )
  .setVersion('1.0.0')
  .setContact('Weather Dashboard Team', '', '')
  .setLicense('MIT', 'https://opensource.org/licenses/MIT')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    },
    'JWT-auth',
  )
  .addServer('http://localhost:3000', 'Development server')
  .addServer('https://api.example.com', 'Production server')
  .addTag('Auth', 'Endpoints de autenticação')
  .addTag('Weather', 'Endpoints relacionados a dados climáticos')
  .addTag('Users', 'Endpoints de gerenciamento de usuários')
  .addTag('Explore', 'Explorar cidades do mundo com clima')
  .build();
