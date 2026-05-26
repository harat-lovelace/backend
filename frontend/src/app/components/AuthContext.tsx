import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL } from '../apiConfig';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const result = await response.json();
      
      if (result.success) {
        const userPayload = result.data;
        setUser(userPayload);
        localStorage.setItem('currentUser', JSON.stringify(userPayload));
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
      const response = await fetch(`${API_BASE_URL}/signup.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, role })
      });
      
      const result = await response.json();
      
      if (result.success) {
        const userPayload = result.data;
        setUser(userPayload);
        localStorage.setItem('currentUser', JSON.stringify(userPayload));
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
      await fetch(`${API_BASE_URL}/logout.php`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Logout API error:', error);
    }
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser, isAuthenticated: !!user }}>
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
