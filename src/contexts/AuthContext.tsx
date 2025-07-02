import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  type: 'user' | 'organization';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, userType: 'user' | 'organization') => Promise<void>;
  register: (email: string, password: string, name: string, userType: 'user' | 'organization') => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('truthsense_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, userType: 'user' | 'organization') => {
    // Mock login - in production, this would call your API
    const mockUser: User = {
      id: '1',
      email,
      name: email.split('@')[0],
      type: userType,
    };
    setUser(mockUser);
    localStorage.setItem('truthsense_user', JSON.stringify(mockUser));
  };

  const register = async (email: string, password: string, name: string, userType: 'user' | 'organization') => {
    // Mock register - in production, this would call your API
    const mockUser: User = {
      id: '1',
      email,
      name,
      type: userType,
    };
    setUser(mockUser);
    localStorage.setItem('truthsense_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('truthsense_user');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};