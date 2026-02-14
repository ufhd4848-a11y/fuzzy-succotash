'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import { User } from '@/types';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const { setUser, logout } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiClient.get<User>('/auth/me');
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          logout();
        }
      } catch (error) {
        // User is not authenticated, clear any stale data
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [setUser, logout]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}