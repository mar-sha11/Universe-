/**
 * UniVerse Frontend Configuration
 * API endpoint management for different environments
 */

const CONFIG = {
  // API Base URL - automatically detects environment
  API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : '/api',
  
  // Environment detection
  ENV: window.location.hostname === 'localhost' ? 'development' : 'production',
  
  // API Endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      SIGNUP: '/auth/signup',
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      ME: '/auth/me',
      VERIFY_EMAIL: '/auth/verify-email'
    },
    
    // Jobs
    JOBS: {
      LIST: '/jobs',
      CREATE: '/jobs',
      GET: (id) => `/jobs/${id}`,
      UPDATE: (id) => `/jobs/${id}`,
      DELETE: (id) => `/jobs/${id}`,
      APPLY: (id) => `/jobs/${id}/apply`
    },
    
    // Conversations
    CONVERSATIONS: {
      LIST: '/conversations',
      GET: (id) => `/conversations/${id}`,
      CREATE: '/conversations',
      SEND_MESSAGE: (id) => `/conversations/${id}/messages`
    },
    
    // Users
    USERS: {
      PROFILE: (id) => `/users/${id}`,
      UPDATE_PROFILE: '/users/profile'
    },
    
    // Tribes
    TRIBES: {
      LIST: '/tribes',
      GET: (id) => `/tribes/${id}`,
      JOIN: (id) => `/tribes/${id}/join`
    }
  },
  
  // Helper function to build full API URL
  getApiUrl: function(endpoint) {
    return this.API_BASE_URL + endpoint;
  },
  
  // Helper function for API calls
  api: async function(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };
    
    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };
    
    try {
      const response = await fetch(this.getApiUrl(endpoint), config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
