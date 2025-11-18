import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Products API
export const productsAPI = {
  getAll: async (params?: { category?: string; search?: string; available?: boolean }) => {
    const response = await api.get('/products', { params });
    return response.data.data.products;
  },

  getById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data.data.product;
  },

  create: async (productData: any) => {
    const response = await api.post('/products', productData);
    return response.data.data.product;
  },

  update: async (id: string, productData: any) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data.data.product;
  },

  delete: async (id: string) => {
    await api.delete(`/products/${id}`);
  },
};

// Categories API
export const categoriesAPI = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data.data.categories;
  },

  create: async (categoryData: any) => {
    const response = await api.post('/categories', categoryData);
    return response.data.data.category;
  },

  update: async (id: string, categoryData: any) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data.data.category;
  },

  delete: async (id: string) => {
    await api.delete(`/categories/${id}`);
  },
};

// Toppings API
export const toppingsAPI = {
  getAll: async (params?: { category?: string; available?: boolean }) => {
    const response = await api.get('/toppings', { params });
    return response.data.data.toppings;
  },

  create: async (toppingData: any) => {
    const response = await api.post('/toppings', toppingData);
    return response.data.data.topping;
  },

  update: async (id: string, toppingData: any) => {
    const response = await api.put(`/toppings/${id}`, toppingData);
    return response.data.data.topping;
  },

  delete: async (id: string) => {
    await api.delete(`/toppings/${id}`);
  },
};

// Orders API
export const ordersAPI = {
  getAll: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await api.get('/orders', { params });
    return response.data.data.orders;
  },

  getAllAdmin: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await api.get('/orders/admin/all', { params });
    return response.data.data.orders;
  },

  getById: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data.data.order;
  },

  create: async (orderData: any) => {
    const response = await api.post('/orders', orderData);
    return response.data.data.order;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data.data.order;
  },
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data.data;
  },

  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data.data.user;
  },
};

// Settings API
export const settingsAPI = {
  get: async () => {
    const response = await api.get('/settings');
    return response.data.data.settings;
  },

  update: async (settingsData: any) => {
    const response = await api.put('/settings', settingsData);
    return response.data.data.settings;
  }
};

export default api;
