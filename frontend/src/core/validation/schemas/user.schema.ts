import { z } from 'zod';

export const userRoleEnum = z.enum(['user', 'admin']);

export const userSchema = z.object({
  _id: z.string().optional(),
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  active: z.boolean(),
  role: userRoleEnum.default('user'),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  name: z.string().min(1, 'Nome é obrigatório'),
  role: userRoleEnum.optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional().or(z.literal('')),
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  active: z.boolean().optional(),
  role: userRoleEnum.optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export type User = z.infer<typeof userSchema>;
export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type LoginDto = z.infer<typeof loginSchema>;

