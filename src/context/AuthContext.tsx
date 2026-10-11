import React, { createContext, useContext, useState } from 'react';
import { User, Address } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateAddress: (address: Address) => void;
  switchDemoRole: (role: 'admin' | 'customer') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    // Default to customer for instant friendly storefront browsing
    const existing = api.getCurrentUser();
    if (existing) return existing;
    const defaultUser = api.getUsers().find((u) => u.role === 'customer') || null;
    if (defaultUser) {
      api.setCurrentUser(defaultUser);
    }
    return defaultUser;
  });

  const isAdmin = currentUser?.role === 'admin';

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const user = api.login(email, password);
      setCurrentUserState(user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const user = api.register(name, email, password);
      setCurrentUserState(user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const logout = () => {
    api.setCurrentUser(null);
    setCurrentUserState(null);
  };

  const updateAddress = (address: Address) => {
    if (!currentUser) return;
    const updated = api.updateUserAddress(currentUser.id, address);
    setCurrentUserState({ ...updated });
  };

  const switchDemoRole = (role: 'admin' | 'customer') => {
    const user = api.getUsers().find((u) => u.role === role);
    if (user) {
      api.setCurrentUser(user);
      setCurrentUserState({ ...user });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        login,
        register,
        logout,
        updateAddress,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
