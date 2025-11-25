import type { LoginDto } from '../validation';
import { apiClient } from './client';

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role?: 'user' | 'admin';
  };
}

export type { LoginDto };

export const authApi = {
  login: (data: LoginDto) => apiClient.post<LoginResponse>('/auth/login', data),
};

