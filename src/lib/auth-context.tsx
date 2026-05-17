"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
  jobTitle: string;
  departmentId: string;
  managerId: string | null;
  department?: { id: string; name: string };
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (userId: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: () => {},
  switchRole: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('atomquest_user');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch { /* ignore */ }
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !pathname.startsWith('/auth') && pathname !== '/') {
      if (!user) {
        router.push('/auth/login');
        return;
      }
      
      const role = user.role;
      if (pathname.startsWith('/admin') && role !== 'ADMIN') {
        router.replace('/dashboard');
      } else if (pathname.startsWith('/manager') && !['MANAGER', 'ADMIN'].includes(role)) {
        router.replace('/dashboard');
      }
    }
  }, [user, loading, pathname, router]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      setUser(data.user);
      localStorage.setItem('atomquest_user', JSON.stringify(data.user));

      if (data.user.role === 'ADMIN') router.push('/admin');
      else if (data.user.role === 'MANAGER') router.push('/manager');
      else router.push('/dashboard');

      return { success: true };
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  const register = async (userData: any) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      setUser(data.user);
      localStorage.setItem('atomquest_user', JSON.stringify(data.user));

      if (data.user.role === 'ADMIN') router.push('/admin');
      else if (data.user.role === 'MANAGER') router.push('/manager');
      else router.push('/dashboard');

      return { success: true };
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    // In a real app we'd also call Supabase sign out
    setUser(null);
    localStorage.removeItem('atomquest_user');
    
    // Call server to clear Supabase cookie
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    
    router.push('/auth/login');
  };

  const switchRole = async (userId: string) => {
    const res = await fetch(`/api/users`);
    const users = await res.json();
    const target = users.find((u: AuthUser) => u.id === userId);
    if (target) {
      setUser(target);
      localStorage.setItem('atomquest_user', JSON.stringify(target));
      if (target.role === 'ADMIN') router.push('/admin');
      else if (target.role === 'MANAGER') router.push('/manager');
      else router.push('/dashboard');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
