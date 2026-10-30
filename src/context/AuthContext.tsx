import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../server/types';
import { api, getStoredToken, removeStoredToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  quickDemoLogin: (role?: 'inspector' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      const token = getStoredToken();
      if (!token) {
        // Fallback default mock/guest session so user can immediately browse with full functionality
        setUser({
          id: 'u-001-inspector',
          name: 'Sarah Jenkins',
          email: 'inspector@visionguard.ai',
          password_hash: '',
          role: 'inspector',
          avatar_url: '/src/assets/images/inspector_avatar_1793339695243.jpg',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setLoading(false);
        return;
      }

      try {
        const res = await api.getMe();
        setUser(res.user);
      } catch (err) {
        console.warn('Session expired, defaulting to active inspector session');
        removeStoredToken();
        setUser({
          id: 'u-001-inspector',
          name: 'Sarah Jenkins',
          email: 'inspector@visionguard.ai',
          password_hash: '',
          role: 'inspector',
          avatar_url: '/src/assets/images/inspector_avatar_1793339695243.jpg',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role = 'inspector') => {
    setLoading(true);
    try {
      const res = await api.register(name, email, password, role);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    removeStoredToken();
    setUser(null);
  };

  const quickDemoLogin = async (role: 'inspector' | 'admin' = 'inspector') => {
    const email = role === 'admin' ? 'admin@visionguard.ai' : 'inspector@visionguard.ai';
    await login(email, 'password123');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, quickDemoLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
