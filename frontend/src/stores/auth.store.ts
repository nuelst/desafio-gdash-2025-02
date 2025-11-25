import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id?: string;
  _id?: string;
  email: string;
  name: string;
  role?: 'user' | 'admin';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),
      setUser: (user) =>
        set((state) => ({
          ...state,
          user,
        })),
      clearAuth: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage',
    },
  ),
);

