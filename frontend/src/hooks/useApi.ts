import { useState, useCallback } from 'react';
import { API_URL } from '../config';

export interface ApiOptions {
  method?: string;
  body?: any;
  requiresAuth?: boolean;
  contentType?: string;
  token?: string;
}

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T = any>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const request = useCallback(
    async (endpoint: string, options: ApiOptions = {}) => {
      const {
        method = 'GET',
        body = null,
        requiresAuth = false,
        contentType = 'application/json',
        token = null,
      } = options;

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // Build headers
        const headers: HeadersInit = {};
        
        if (contentType) {
          headers['Content-Type'] = contentType;
        }
        
        if (requiresAuth) {
          if (!token) {
            throw new Error('Authentication required');
          }
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Prepare request options
        const requestOptions: RequestInit = {
          method,
          headers,
          body: body ? (contentType === 'application/json' ? JSON.stringify(body) : body) : null,
        };

        // Make the request
        const response = await fetch(`${API_URL}${endpoint}`, requestOptions);

        // Handle non-200 responses
        if (!response.ok) {
          // Try to parse error response if possible
          let errorMessage = `API error: ${response.status} ${response.statusText}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (parseError) {
            // If we can't parse JSON, just use the status
            console.error('Error parsing error response:', parseError);
          }
          throw new Error(errorMessage);
        }

        // Parse the response
        const responseData = await response.json();
        
        // Handle new response format with data field vs. old format
        const data = responseData.success && responseData.data
          ? responseData.data
          : responseData;
        
        setState({ data, loading: false, error: null });
        return data;
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'An unknown error occurred';
        
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        throw error;
      }
    },
    []
  );

  return {
    ...state,
    request,
  };
}

export default useApi;