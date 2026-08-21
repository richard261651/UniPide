'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession } from '@/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (correo: string, password: string) => Promise<{ success: boolean; error?: string; user?: UserSession }>;
  register: (data: {
    nombre: string;
    correo: string;
    correoPersonal?: string;
    password: string;
    rol: 'CLIENTE' | 'EMPRENDEDOR' | 'ADMIN';
    telefono?: string;
    twoFactorSecret?: string;
    nombreNegocio?: string;
    categoriaNegocio?: string;
    ubicacionCampus?: string;
    zonaCampusCodigo?: string;
    descripcionNegocio?: string;
    adminKey?: string;
  }) => Promise<{ success: boolean; error?: string; user?: UserSession }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Error cargando sesión:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (correo: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Error al iniciar sesión' };
      }

      setUser(data.user);

      // Redirigir según el rol
      if (data.user.rol === 'ADMIN') {
        router.push('/admin');
      } else if (data.user.rol === 'EMPRENDEDOR') {
        router.push('/emprendedor');
      } else {
        router.push('/');
      }

      return { success: true, user: data.user };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de conexión' };
    }
  };

  const register = async (formData: any) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Error en el registro' };
      }

      setUser(data.user);

      if (data.user.rol === 'ADMIN') {
        router.push('/admin');
      } else if (data.user.rol === 'EMPRENDEDOR') {
        router.push('/emprendedor');
      } else {
        router.push('/');
      }

      return { success: true, user: data.user };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de conexión' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Error cerrando sesión:', err);
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
