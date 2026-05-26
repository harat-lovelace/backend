# 🔗 FRONTEND-BACKEND INTEGRATION GUIDE

Complete guide for connecting your React frontend to the PHP backend API.

## 📋 TABLE OF CONTENTS

1. [Integration Overview](#integration-overview)
2. [API Service Setup](#api-service-setup)
3. [Authentication Integration](#authentication-integration)
4. [Update Components](#update-components)
5. [Error Handling](#error-handling)
6. [Testing Integration](#testing-integration)

---

## 🔄 INTEGRATION OVERVIEW

### Current State (Before)
```
React Frontend → localStorage → JSON data
(Client-side only, no backend)
```

### Target State (After)
```
React Frontend → Fetch API → PHP Backend → MySQL Database
(Full-stack with persistent data)
```

---

## 🛠️ API SERVICE SETUP

### Step 1: Create API Service File

Create: `src/services/api.ts`

```typescript
/**
 * API Service
 * Centralized service for all backend API calls
 */

const API_BASE_URL = 'http://localhost/jenjen-po-main/backend';

// Type for API response
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
  pagination?: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

/**
 * Fetch API with error handling
 */
async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get auth token if exists
  const token = localStorage.getItem('authToken');
  
  // Set default headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    const data: ApiResponse<T> = await response.json();
    
    // Handle non-2xx responses
    if (!response.ok) {
      throw new Error(data.message || `HTTP Error: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * AUTHENTICATION ENDPOINTS
 */

export const authAPI = {
  signup: (data: {
    full_name: string;
    email: string;
    password: string;
    confirm_password: string;
  }) => apiFetch('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  login: (email: string, password: string) =>
    apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getCurrentUser: () => apiFetch('/api/auth/me', {
    method: 'GET',
  }),
};

/**
 * ORDERS ENDPOINTS
 */

export const ordersAPI = {
  create: (data: any) =>
    apiFetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  list: (params?: { page?: number; per_page?: number; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.per_page) query.append('per_page', params.per_page.toString());
    if (params?.status) query.append('status', params.status);
    
    return apiFetch(`/api/orders?${query.toString()}`, { method: 'GET' });
  },

  getById: (id: number) =>
    apiFetch(`/api/orders?id=${id}`, { method: 'GET' }),

  update: (id: number, data: any) =>
    apiFetch(`/api/orders?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiFetch(`/api/orders?id=${id}`, { method: 'DELETE' }),

  search: (query: string, page?: number) => {
    const params = new URLSearchParams();
    params.append('q', query);
    if (page) params.append('page', page.toString());
    
    return apiFetch(`/api/orders/search?${params.toString()}`, {
      method: 'GET',
    });
  },
};

/**
 * BOOKINGS ENDPOINTS
 */

export const bookingsAPI = {
  create: (data: any) =>
    apiFetch('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  list: (params?: {
    page?: number;
    per_page?: number;
    status?: string;
    date?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.per_page) query.append('per_page', params.per_page.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.date) query.append('date', params.date);
    
    return apiFetch(`/api/bookings?${query.toString()}`, { method: 'GET' });
  },

  getById: (id: number) =>
    apiFetch(`/api/bookings?id=${id}`, { method: 'GET' }),

  update: (id: number, data: any) =>
    apiFetch(`/api/bookings?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiFetch(`/api/bookings?id=${id}`, { method: 'DELETE' }),

  checkAvailability: (date: string) =>
    apiFetch(`/api/bookings/availability?date=${date}`, { method: 'GET' }),
};

export default { authAPI, ordersAPI, bookingsAPI };
```

---

## 🔐 AUTHENTICATION INTEGRATION

### Step 1: Update AuthContext

Edit: `src/app/components/AuthContext.tsx`

Replace the entire file with:

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../../services/api';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'customer' | 'admin';
  token: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user on mount or token change
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');

    if (token && userName && userEmail && userRole && userId) {
      setCurrentUser({
        id: parseInt(userId),
        email: userEmail,
        full_name: userName,
        role: userRole as 'customer' | 'admin',
        token,
      });
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.login(email, password);

      if (!response.success) {
        throw new Error(response.message);
      }

      const user = response.data;
      setCurrentUser(user);

      // Store auth data
      localStorage.setItem('authToken', user.token);
      localStorage.setItem('userId', user.id.toString());
      localStorage.setItem('userName', user.full_name);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userRole', user.role);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: any) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.signup(data);

      if (!response.success) {
        throw new Error(response.message);
      }

      const user = response.data;
      setCurrentUser(user);

      // Store auth data
      localStorage.setItem('authToken', user.token);
      localStorage.setItem('userId', user.id.toString());
      localStorage.setItem('userName', user.full_name);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userRole', user.role);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        error,
        login,
        signup,
        logout,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

---

## 🔄 UPDATE COMPONENTS

### LoginPage.tsx

Replace the login function in `src/app/components/LoginPage.tsx`:

```typescript
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    await login(email, password);
    navigate(currentUser?.role === 'admin' ? '/admin' : '/dashboard');
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Login failed');
  } finally {
    setLoading(false);
  }
};
```

### SignupPage.tsx

Replace the signup function in `src/app/components/SignupPage.tsx`:

```typescript
const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    await signup({
      full_name: fullName,
      email,
      password,
      confirm_password: confirmPassword,
    });
    navigate('/dashboard');
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Signup failed');
  } finally {
    setLoading(false);
  }
};
```

### OrderPage.tsx

Replace the create order function:

```typescript
import { ordersAPI } from '../../services/api';

const handleCreateOrder = async (formData: any) => {
  try {
    setLoading(true);
    const response = await ordersAPI.create(formData);
    
    if (response.success) {
      toast.success('Order created successfully!');
      navigate('/dashboard');
    } else {
      toast.error(response.message);
    }
  } catch (error) {
    toast.error('Failed to create order');
  } finally {
    setLoading(false);
  }
};
```

### SchedulePage.tsx

Replace the booking creation:

```typescript
import { bookingsAPI } from '../../services/api';

const handleBooking = async (date: string, time: string, serviceType: string) => {
  try {
    setLoading(true);
    const response = await bookingsAPI.create({
      booking_date: date,
      booking_time: time,
      service_type: serviceType,
    });
    
    if (response.success) {
      toast.success('Booking created successfully!');
      // Refresh bookings
      fetchBookings();
    } else {
      toast.error(response.message);
    }
  } catch (error) {
    toast.error('Failed to create booking');
  } finally {
    setLoading(false);
  }
};

const fetchAvailability = async (date: string) => {
  try {
    const response = await bookingsAPI.checkAvailability(date);
    setAvailableSlots(response.data?.slots || []);
  } catch (error) {
    console.error('Failed to fetch availability:', error);
  }
};
```

### CustomerDashboard.tsx

Replace data fetching:

```typescript
import { ordersAPI, bookingsAPI } from '../../services/api';

useEffect(() => {
  const fetchData = async () => {
    try {
      // Fetch orders
      const ordersResponse = await ordersAPI.list();
      setOrders(ordersResponse.data || []);

      // Fetch bookings
      const bookingsResponse = await bookingsAPI.list();
      setBookings(bookingsResponse.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  fetchData();
}, []);
```

### AdminDashboard.tsx

Replace admin dashboard data:

```typescript
import { ordersAPI, bookingsAPI } from '../../services/api';

useEffect(() => {
  const fetchAdminData = async () => {
    try {
      // Fetch all orders
      const ordersResponse = await ordersAPI.list({
        per_page: 5,
        page: 1,
      });
      setOrders(ordersResponse.data || []);
      
      const stats = {
        totalOrders: ordersResponse.pagination?.total || 0,
        inProgress: ordersResponse.data?.filter(
          (o: any) => o.status !== 'Ready for Pickup'
        ).length || 0,
        readyForPickup: ordersResponse.data?.filter(
          (o: any) => o.status === 'Ready for Pickup'
        ).length || 0,
      };
      setOrderStats(stats);

      // Fetch pending bookings
      const bookingsResponse = await bookingsAPI.list({
        status: 'pending',
      });
      setPendingBookings(bookingsResponse.data || []);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    }
  };

  fetchAdminData();
}, []);
```

### AdminOrderManagement.tsx

Replace order management:

```typescript
import { ordersAPI } from '../../services/api';

const fetchOrders = async () => {
  try {
    setLoading(true);
    const query = searchTerm ? `/api/orders/search?q=${searchTerm}` : '/api/orders';
    const response = searchTerm 
      ? await ordersAPI.search(searchTerm)
      : await ordersAPI.list();
    setOrders(response.data || []);
  } catch (error) {
    toast.error('Failed to fetch orders');
  } finally {
    setLoading(false);
  }
};

const handleStatusChange = async (orderId: number, newStatus: string) => {
  try {
    const response = await ordersAPI.update(orderId, {
      status: newStatus,
    });
    if (response.success) {
      toast.success('Order status updated');
      fetchOrders();
    }
  } catch (error) {
    toast.error('Failed to update order');
  }
};

const handleDeleteOrder = async (orderId: number) => {
  if (confirm('Are you sure you want to delete this order?')) {
    try {
      await ordersAPI.delete(orderId);
      toast.success('Order deleted');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to delete order');
    }
  }
};
```

### AdminScheduleManagement.tsx

Replace booking management:

```typescript
import { bookingsAPI } from '../../services/api';

const fetchBookings = async () => {
  try {
    setLoading(true);
    const response = await bookingsAPI.list({
      status: filterStatus || undefined,
      date: filterDate || undefined,
    });
    setBookings(response.data || []);
  } catch (error) {
    toast.error('Failed to fetch bookings');
  } finally {
    setLoading(false);
  }
};

const handleAcceptBooking = async (bookingId: number) => {
  try {
    const response = await bookingsAPI.update(bookingId, {
      status: 'accepted',
    });
    if (response.success) {
      toast.success('Booking accepted');
      fetchBookings();
    }
  } catch (error) {
    toast.error('Failed to accept booking');
  }
};

const handleRejectBooking = async (bookingId: number) => {
  try {
    const response = await bookingsAPI.update(bookingId, {
      status: 'rejected',
    });
    if (response.success) {
      toast.success('Booking rejected');
      fetchBookings();
    }
  } catch (error) {
    toast.error('Failed to reject booking');
  }
};
```

---

## ⚠️ ERROR HANDLING

### Add Global Error Handler

Create: `src/services/errorHandler.ts`

```typescript
/**
 * Global error handler for API calls
 */

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors?: Record<string, string>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: any): string => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof TypeError) {
    return 'Network error. Please check your connection.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
};
```

### Update API Service with Error Handling

```typescript
async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.clear();
        window.location.href = '/login';
      }
      
      throw new ApiError(
        response.status,
        data.message,
        data.errors
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(0, 'Network error occurred');
  }
}
```

---

## ✅ TESTING INTEGRATION

### Step 1: Test Login

1. Go to http://localhost:5173/login
2. Click "Demo Customer" button
3. Should call backend API
4. Should store JWT token
5. Should redirect to dashboard

### Step 2: Test Order Creation

1. Go to http://localhost:5173/order
2. Fill in form and submit
3. Check Network tab in DevTools
4. Should see POST request to `/api/orders`
5. Should create order in database

### Step 3: Test Order Display

1. Go to http://localhost:5173/dashboard
2. Should fetch and display orders from backend
3. Check Network tab - should see GET request to `/api/orders`
4. Orders from database should display

### Step 4: Test Booking Creation

1. Go to http://localhost:5173/schedule
2. Select date and time
3. Check availability is loaded from backend
4. Submit booking
5. Should create booking in database

### Step 5: Verify Database

```bash
mysql -u root -p laundry_system -e "SELECT * FROM orders LIMIT 5;"
mysql -u root -p laundry_system -e "SELECT * FROM bookings LIMIT 5;"
```

---

## 🚀 DEPLOYMENT

Before deploying to production:

1. Update `API_BASE_URL` to production backend URL
2. Change `JWT_SECRET` in backend config
3. Enable HTTPS
4. Add production domain to CORS allowed origins
5. Remove debug logging
6. Test all features thoroughly

---

## ✨ Complete Integration Checklist

- [ ] API service created (`api.ts`)
- [ ] AuthContext updated
- [ ] LoginPage connected to backend
- [ ] SignupPage connected to backend
- [ ] OrderPage creates orders via API
- [ ] CustomerDashboard fetches orders from API
- [ ] AdminDashboard fetches data from API
- [ ] AdminOrderManagement uses API
- [ ] AdminScheduleManagement uses API
- [ ] SchedulePage uses API for bookings
- [ ] Error handling implemented
- [ ] JWT token stored and used
- [ ] All components tested
- [ ] Database has records from frontend

Congratulations! Your frontend is now fully integrated with the backend! 🎉
