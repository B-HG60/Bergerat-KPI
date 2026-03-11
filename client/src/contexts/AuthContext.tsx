import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isManager: boolean;
  isCollaborateur: boolean;
  canEdit: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = api.getToken();
    if (token) {
      api.getMe()
        .then(setUser)
        .catch(() => api.setToken(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    api.setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'ADMIN';
  const isManager = user?.role === 'MANAGER';
  const isCollaborateur = user?.role === 'COLLABORATEUR';
  const canEdit = isAdmin || isManager;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isManager, isCollaborateur, canEdit }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
}
