import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiPost, checkBackendHealth } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (name: string, email: string, password: string, role: 'customer' | 'admin') => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: User) => void;
  isAuthenticated: boolean;
  backendConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [backendConnected, setBackendConnected] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // Check backend health on mount
    checkBackendHealth().then(setBackendConnected);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const result = await apiPost<{ id: string; name: string; email: string; role: 'customer' | 'admin'; token?: string }>('/auth/login', { email, password }, { skipErrorToast: true });
      
      if (result.success && result.data) {
        const userPayload = result.data;
        setUser(userPayload);
        localStorage.setItem('currentUser', JSON.stringify(userPayload));
        if (result.data.token) {
          localStorage.setItem('authToken', result.data.token);
        }
        return { success: true };
      } else {
        return { success: false, message: result.message || 'Incorrect email or password.' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Unable to connect to the backend server. Please check if PHP is running.' };
    }
  };

  const signup = async (name: string, email: string, password: string, role: 'customer' | 'admin' = 'customer'): Promise<{ success: boolean; message?: string }> => {
    try {
      const result = await apiPost<{ id: string; name: string; email: string; role: 'customer' | 'admin'; token?: string }>('/auth/signup', { name, email, password, role }, { skipErrorToast: true });
      
      if (result.success && result.data) {
        const userPayload = result.data;
        setUser(userPayload);
        localStorage.setItem('currentUser', JSON.stringify(userPayload));
        if (result.data.token) {
          localStorage.setItem('authToken', result.data.token);
        }
        return { success: true };
      } else {
        return { success: false, message: result.message || 'An error occurred during registration.' };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: 'Unable to connect to the backend server. Please check if PHP is running.' };
    }
  };

  const logout = async () => {
    try {
      await apiPost('/auth/logout', {}, { skipErrorToast: true });
    } catch (error) {
      console.error('Logout API error:', error);
    }
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser, isAuthenticated: !!user, backendConnected }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
