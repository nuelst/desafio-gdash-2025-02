import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Weather Dashboard API')
  .setDescription('API RESTful para dashboard climático com dados meteorológicos em tempo real')
  .setVersion('1.0.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'JWT token',
    },
    'JWT-auth',
  )
  .addTag('Auth', 'Autenticação')
  .addTag('Weather', 'Dados climáticos')
  .addTag('Users', 'Usuários')
  .addTag('Explore', 'Explorar cidades')
  .build();
