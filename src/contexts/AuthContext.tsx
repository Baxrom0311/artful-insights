import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authApi } from '@/lib/api';
import type { AuthTokens, RegisterData, User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const profileRequestIdRef = useRef(0);

  const storeTokens = useCallback((tokens: AuthTokens) => {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
  }, []);

  const clearStoredAuth = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const requestId = ++profileRequestIdRef.current;

    try {
      const { data } = await authApi.getProfile();
      if (profileRequestIdRef.current === requestId) {
        setUser(data);
      }
    } catch {
      if (profileRequestIdRef.current === requestId) {
        clearStoredAuth();
      }
    }
  }, [clearStoredAuth]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [refreshUser]);

  const login = async (username: string, password: string) => {
    profileRequestIdRef.current += 1;
    const { data } = await authApi.login({ username, password });
    storeTokens(data);
    await refreshUser();
  };

  const register = async (regData: RegisterData) => {
    profileRequestIdRef.current += 1;
    const { data } = await authApi.register(regData);
    storeTokens(data.tokens);
    setUser(data.user);
  };

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) await authApi.logout(refresh);
    } catch { /* ignore */ }
    profileRequestIdRef.current += 1;
    clearStoredAuth();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
