import type { CreateUserDto, UpdateUserDto, User } from '../validation';
import { apiClient } from './client';

export type { CreateUserDto, UpdateUserDto, User };

export const usersApi = {
  getAll: () => apiClient.get<User[]>('/users'),

  getById: (id: string) => apiClient.get<User>(`/users/${id}`),

  create: (data: CreateUserDto) => apiClient.post<User>('/users', data),

  update: (id: string, data: UpdateUserDto) =>
    apiClient.patch<User>(`/users/${id}`, data),

  delete: (id: string) => apiClient.delete(`/users/${id}`),
};

