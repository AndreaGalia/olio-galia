import { useState, useEffect } from 'react';

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
  lastLogin?: string;
  createdAt: string;
}

interface UseAdminAuthReturn {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export function useAdminAuth(): UseAdminAuthReturn {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Verifica se l'utente è già autenticato
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/me');
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Errore verifica autenticazione:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return true;
      } else {
        console.error('Login fallito:', data.error);
        return false;
      }
    } catch (error) {
      console.error('Errore durante il login:', error);
      return false;
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Errore durante il logout:', error);
    } finally {
      setUser(null);
    }
  };

  // Refresh user data
  const refreshUser = async (): Promise<void> => {
    if (user) {
      await checkAuth();
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    user,
    loading,
    login,
    logout,
    refreshUser,
  };
}