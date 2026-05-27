/**
 * Centralized API Service
 * Handles all HTTP requests to the backend with proper error handling
 * Uses the configured API_BASE_URL from apiConfig.ts
 */

import { API_BASE_URL } from '../apiConfig';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface FetchOptions extends RequestInit {
  skipErrorToast?: boolean;
  showSuccessToast?: boolean;
}

/**
 * Make an API request with automatic error handling
 * @param endpoint - The API endpoint (e.g., '/auth/signup')
 * @param options - Fetch options (method, body, headers, etc.)
 * @returns Promise with the parsed response
 */
export async function apiCall<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    headers = {},
    skipErrorToast = false,
    showSuccessToast = false,
    ...restOptions
  } = options;

  try {
    // Ensure endpoint starts with /
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Construct full URL
    const url = `${API_BASE_URL}${path}`;

    // Prepare headers
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    // Make the request
    const response = await fetch(url, {
      method,
      headers: defaultHeaders,
      ...restOptions,
    });

    // Parse response
    const data: ApiResponse<T> = await response.json();

    // Handle HTTP errors
    if (!response.ok) {
      console.error(`API Error [${response.status}]:`, data);
      
      if (!skipErrorToast) {
        // You can add toast notification here if available
        // toast.error(data.message || 'An error occurred');
      }

      return {
        success: false,
        message: data.message || 'An error occurred',
        errors: data.errors,
      };
    }

    if (showSuccessToast && data.message) {
      // You can add toast notification here if available
      // toast.success(data.message);
    }

    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Network error';
    console.error('API Call Error:', errorMessage);

    if (!skipErrorToast) {
      // You can add toast notification here if available
      // toast.error('Unable to connect to the backend server. Please check if PHP is running.');
    }

    return {
      success: false,
      message: 'Unable to connect to the backend server. Please check if PHP is running.',
    };
  }
}

/**
 * GET request
 */
export async function apiGet<T = any>(
  endpoint: string,
  options?: FetchOptions
): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, { ...options, method: 'GET' });
}

/**
 * POST request
 */
export async function apiPost<T = any>(
  endpoint: string,
  body?: any,
  options?: FetchOptions
): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT request
 */
export async function apiPut<T = any>(
  endpoint: string,
  body?: any,
  options?: FetchOptions
): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE request
 */
export async function apiDelete<T = any>(
  endpoint: string,
  options?: FetchOptions
): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, { ...options, method: 'DELETE' });
}

/**
 * Health check to verify backend is running
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await apiCall('/health', { skipErrorToast: true });
    return response.success;
  } catch {
    return false;
  }
}
