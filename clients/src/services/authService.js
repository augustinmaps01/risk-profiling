import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/constants';

// Create axios instance with base configuration
const authAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add token to requests
authAPI.interceptors.request.use(
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

// Response interceptor to handle token expiration
authAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Immediate token expiration handling
      const errorCode = error.response?.data?.error_code;
      
      console.log('401 Unauthorized - token expired or invalid', errorCode);
      
      // Clear auth data immediately
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      
      // Import session manager dynamically to avoid circular deps
      import('./sessionManager').then(({ default: sessionManager }) => {
        if (sessionManager.isUserActive()) {
          // Use specific error code if available
          const reason = errorCode === 'TOKEN_EXPIRED' ? 'token_expired' : 'token_invalid';
          sessionManager.autoLogout(reason);
        } else {
          // If session manager not active, redirect directly
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      });
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Authentication
  async login(credentials) {
    const response = await authAPI.post(API_ENDPOINTS.LOGIN, credentials);
    return response.data;
  },

  async register(userData) {
    const response = await authAPI.post(API_ENDPOINTS.REGISTER, userData);
    return response.data;
  },

  async logout() {
    const response = await authAPI.post(API_ENDPOINTS.LOGOUT);
    return response.data;
  },

  async logoutAll() {
    const response = await authAPI.post(API_ENDPOINTS.LOGOUT_ALL);
    return response.data;
  },

  // Profile management
  async getProfile() {
    const response = await authAPI.get(API_ENDPOINTS.PROFILE);
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await authAPI.put(API_ENDPOINTS.PROFILE, profileData);
    return response.data;
  },

  async changePassword(passwordData) {
    const response = await authAPI.put(API_ENDPOINTS.CHANGE_PASSWORD, passwordData);
    return response.data;
  },

  // Token management
  async getTokens() {
    const response = await authAPI.get(API_ENDPOINTS.TOKENS);
    return response.data;
  },

  async revokeToken(tokenId) {
    const response = await authAPI.delete(`${API_ENDPOINTS.TOKENS}/${tokenId}`);
    return response.data;
  },

  // Role and permission checks (client-side helpers)
  hasRole(user, role) {
    if (!user || !user.roles) return false;
    return user.roles.some(userRole => userRole.slug === role);
  },

  hasPermission(user, permission) {
    if (!user || !user.roles) return false;
    return user.roles.some(role => 
      role.permissions && role.permissions.some(perm => perm.slug === permission)
    );
  },

  isComplianceOfficer(user) {
    return this.hasRole(user, 'compliance');
  },

  isRegularUser(user) {
    return this.hasRole(user, 'users');
  },

  canViewCustomers(user) {
    return this.hasPermission(user, 'view-customers') || 
           this.hasRole(user, 'compliance') || 
           this.hasRole(user, 'users');
  },

  canManageCustomers(user) {
    return this.hasPermission(user, 'manage-customers') || 
           this.hasRole(user, 'compliance') || 
           this.hasRole(user, 'users');
  },
};

export default authService;