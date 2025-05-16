import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useApi } from '../hooks';

// Types
export interface UserPreferences {
  defaultSort?: string;
  defaultCategory?: string;
  theme?: 'light' | 'dark';
  maxBudget?: number;
  minBudget?: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
  preferences: UserPreferences;
}

export interface AuthError {
  message: string;
  code?: string;
  field?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  initializing: boolean; // New flag to indicate auth state is being initialized
  error: AuthError | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  clearError: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true); // Start with initializing = true
  const [error, setError] = useState<AuthError | null>(null);
  
  // Initialize the API hook
  const api = useApi();

  useEffect(() => {
    // Check for stored auth data on mount
    const loadAuthState = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          try {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          } catch (err) {
            // Handle parsing error
            console.error('Error parsing stored user data:', err);
            // Clear invalid storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } catch (err) {
        console.error('Error loading auth state:', err);
      } finally {
        // Mark initialization as complete
        setInitializing(false);
      }
    };

    loadAuthState();
  }, []);

  const clearError = () => {
    setError(null);
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.request('/users/login', {
        method: 'POST',
        body: { email, password },
      });
      
      if (!data.user || !data.token) {
        throw new Error('Invalid response format');
      }
      
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (err) {
      console.error('Login error:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during login';
      setError({ message: errorMessage });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.request('/users/register', {
        method: 'POST',
        body: { email, password, name },
      });
      
      if (!data.user || !data.token) {
        throw new Error('Invalid response format');
      }
      
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (err) {
      console.error('Registration error:', err);
      
      // Handle specific validation errors
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during registration';
      
      // Try to detect field-specific errors
      const lowerCaseMessage = errorMessage.toLowerCase();
      let field: string | undefined = undefined;
      
      if (lowerCaseMessage.includes('email')) {
        field = 'email';
      } else if (lowerCaseMessage.includes('password')) {
        field = 'password';
      } else if (lowerCaseMessage.includes('name')) {
        field = 'name';
      }
      
      setError({ message: errorMessage, field });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updatePreferences = async (preferences: Partial<UserPreferences>) => {
    if (!token) {
      throw new Error('Not authenticated');
    }

    setLoading(true);
    
    try {
      const data = await api.request('/users/preferences', {
        method: 'PATCH',
        body: { preferences },
        requiresAuth: true,
        token: token,
      });
      
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (err) {
      console.error('Error updating preferences:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update preferences';
      setError({ message: errorMessage });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        loading,
        initializing, // Include new initializing state in the context value
        error,
        login, 
        register, 
        logout, 
        updatePreferences,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};