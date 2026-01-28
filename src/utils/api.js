import axios from 'axios';

// Get API base URL - Dynamic based on environment
// Hardcoded for stability - fix dynamic logic if needed later
// Hardcoded for debugging localhost/mobile issue
// 1. Production/Configured URL (Vercel/Render)
// 2. Localhost (desktop): http://127.0.0.1:5173 -> http://127.0.0.1:5000/api
// 3. Mobile LAN (dynamic): http://192.168.x.x:5173 -> http://192.168.x.x:5000/api
const hostname = window.location.hostname;
const isProduction = hostname.includes('vercel.app') || hostname.includes('onrender.com');

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (
    isProduction
        ? 'https://homly-backend-8616.onrender.com/api' // Fallback for Vercel
        : (hostname === 'localhost' || hostname === '127.0.0.1'
            ? 'http://127.0.0.1:5000/api'
            : `http://${hostname}:5000/api`)
);

// Log the API URL being used (helpful for debugging)
console.log('%c🔗 API Configuration', 'color: #3b82f6; font-weight: bold; font-size: 14px;');
console.log('📡 Base URL:', API_BASE_URL);
console.log('🌍 Environment:', import.meta.env.MODE);
console.log('---');

// Create axios instance with base configuration
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000, // 15 seconds timeout (reduced from 2 mins to prevent hanging)
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true // Important: Send cookies with every request
});

// Request interceptor - Add Bearer Token if available (Hybrid Auth)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        const message = error.response?.data?.message || error.message || 'An error occurred';

        // Enhanced error logging for debugging
        console.error('API Error Details:', {
            message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            method: error.config?.method,
            data: error.response?.data,
            hasAuthToken: !!error.config?.headers?.Authorization
        });

        // Global 401 (Unauthorized) Handler
        if (error.response?.status === 401) {
            console.warn('Session expired or unauthorized. Dispatching logout event. URL:', error.config?.url);
            window.dispatchEvent(new Event('auth:unauthorized'));
        }

        return Promise.reject({
            message,
            status: error.response?.status,
            data: error.response?.data,
        });
    }
);

// API methods
export const apiService = {
    // Products
    getProducts: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.category) queryParams.append('category', params.category);
        if (params.search) queryParams.append('search', params.search);
        if (params.featured) queryParams.append('featured', params.featured);
        if (params.storeId) queryParams.append('storeId', params.storeId);

        const queryString = queryParams.toString();
        return api.get(`/products${queryString ? `?${queryString}` : ''}`);
    },
    getProduct: (id) => api.get(`/products/${id}`),
    createProduct: (data) => api.post('/products', data),
    updateProduct: (id, data) => api.put(`/products/${id}`, data),
    deleteProduct: (id) => api.delete(`/products/${id}`),

    // Stores
    getStores: () => api.get('/stores'),
    getStore: (id) => api.get(`/stores/${id}`),
    createStore: (data) => api.post('/stores', data),
    updateStore: (id, data) => api.put(`/stores/${id}`, data),
    deleteStore: (id) => api.delete(`/stores/${id}`),

    // News
    getNews: () => api.get('/news'),
    getNewsItem: (id) => api.get(`/news/${id}`),
    createNews: (data) => api.post('/news', data),
    updateNews: (id, data) => api.put(`/news/${id}`, data),
    deleteNews: (id) => api.delete(`/news/${id}`),

    // Orders
    getOrders: () => api.get('/orders'),
    getOrder: (id) => api.get(`/orders/${id}`),
    createOrder: (data) => api.post('/orders', data),
    updateOrderStatus: (id, status) => api.put(`/orders/${id}`, { status }),
    deleteOrder: (id) => api.delete(`/orders/${id}`),

    // Users
    register: (data) => api.post('/users/register', data),
    login: (data) => api.post('/users/login', data),
    logout: () => api.post('/users/logout'),
    forgotPassword: (email) => api.post('/users/forgotpassword', { email }),
    resetPassword: (token, password) => api.put(`/users/resetpassword/${token}`, { password }),
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),
    getSavedProducts: () => api.get('/users/profile/saved-products'),
    toggleSavedProduct: (productId) => api.post('/users/profile/saved-products', { productId }),

    // Ads
    getAds: () => api.get('/ads'),
    getAd: (id) => api.get(`/ads/${id}`),
    createAd: (data) => api.post('/ads', data),
    updateAd: (id, data) => api.put(`/ads/${id}`, data),
    deleteAd: (id) => api.delete(`/ads/${id}`),

    // Categories
    categories: {
        getAll: () => api.get('/categories'),
        create: (data) => api.post('/categories', data),
        update: (id, data) => api.put(`/categories/${id}`, data),
        delete: (id) => api.delete(`/categories/${id}`),
    },

    // Services
    services: {
        getAll: () => api.get('/services'),
        create: (data) => api.post('/services', data),
        update: (id, data) => api.put(`/services/${id}`, data),
        delete: (id) => api.delete(`/services/${id}`),
    },

    // Service Requests
    serviceRequests: {
        create: (data) => api.post('/service-requests', data),
        getAll: () => api.get('/service-requests'),
        updateStatus: (id, status) => api.put(`/service-requests/${id}`, { status }),
        delete: (id) => api.delete(`/service-requests/${id}`)
    },

    // User Management (Admin)
    getAllUsers: () => api.get('/users'),
    updateUser: (id, data) => api.put(`/users/${id}`, data),
    deleteUser: (id) => api.delete(`/users/${id}`),

    // Settings
    settings: {
        get: (key) => api.get(`/settings${key ? `/${key}` : ''}`),
        update: (key, value) => api.put(`/settings/${key}`, { value })
    }
};

export default api;
