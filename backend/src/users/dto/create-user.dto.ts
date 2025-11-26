import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../domain/entities/user-role.enum';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email do usuário (deve ser único)',
    example: 'user@example.com',
    type: String,
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Senha do usuário (mínimo 6 caracteres)',
    example: 'senha123',
    type: String,
    minLength: 6,
    format: 'password',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Papel do usuário (user ou admin)',
    example: UserRole.USER,
    enum: UserRole,
    required: false,
    default: UserRole.USER,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
