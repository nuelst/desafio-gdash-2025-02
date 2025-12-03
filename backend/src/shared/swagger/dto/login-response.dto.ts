import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    type: String,
  })
  access_token: string;

  @ApiProperty({
    description: 'Dados do usuário autenticado',
    type: 'object',
    properties: {
      id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
      email: { type: 'string', example: 'user@example.com' },
      name: { type: 'string', example: 'João Silva' },
      role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
    },
  })
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}
