import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Tokens } from '@/types';
import { storage } from '@/lib/utils';
import Cookies from 'js-cookie';

// ==========================================
// Auth State Interface
// ==========================================

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setTokens: (tokens: Tokens) => void;
  login: (user: User, tokens: Tokens) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// ==========================================
// Auth Store
// ==========================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // Set user
      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      // Set tokens in cookies
      setTokens: (tokens: Tokens) => {
        Cookies.set('accessToken', tokens.accessToken, { 
          expires: 1 / 96, // 15 minutes
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production',
        });
        Cookies.set('refreshToken', tokens.refreshToken, { 
          expires: 7, // 7 days
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production',
        });
      },

      // Login user
      login: (user: User, tokens: Tokens) => {
        Cookies.set('accessToken', tokens.accessToken, { 
          expires: 1 / 96,
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production',
        });
        Cookies.set('refreshToken', tokens.refreshToken, { 
          expires: 7,
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production',
        });

        set({
          user,
          isAuthenticated: true,
        });
      },

      // Logout user
      logout: () => {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');

        set({
          user: null,
          isAuthenticated: false,
        });
      },

      // Update user data
      updateUser: (userData: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },
    }),
    {
      name: 'sushiwave-auth',
      storage: {
        getItem: (name) => {
          const value = storage.get<string>(name, '');
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => {
          storage.set(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          storage.remove(name);
        },
      },
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

// ==========================================
// Auth Hooks
// ==========================================

export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useIsAdmin = () => 
  useAuthStore((state) => state.user?.role === 'ADMIN');