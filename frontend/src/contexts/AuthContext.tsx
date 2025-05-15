import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config';

interface User {
  id: number;
  email: string;
  name: string;
  preferences: {
    defaultSort?: string;
    defaultCategory?: string;
    theme?: 'light' | 'dark';
    maxBudget?: number;
    minBudget?: number;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updatePreferences: (preferences: Partial<User['preferences']>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored auth data on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      console.log('Starting registration with:', { email, name, passwordLength: password.length });
      
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        throw new Error('Could not parse server response');
      }

      console.log('Registration response status:', response.status);
      console.log('Registration response:', data ? 'Has data' : 'No data');

      if (!response.ok) {
        const errorMessage = data?.message || data?.error || 'Registration failed';
        console.error('Registration failed with message:', errorMessage);
        throw new Error(errorMessage);
      }

      if (!data || !data.token || !data.user) {
        console.error('Invalid registration response format:', data);
        throw new Error('Invalid response from server');
      }

      console.log('Registration successful, setting user state');
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updatePreferences = async (preferences: Partial<User['preferences']>) => {
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      console.log('Updating preferences with token:', token.substring(0, 10) + '...');
      
      const response = await fetch(`${API_URL}/users/preferences`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ preferences }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Preferences update failed:', data);
        throw new Error(data.message || 'Failed to update preferences');
      }

      console.log('Preferences update successful:', data);
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updatePreferences }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 