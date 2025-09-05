import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export const auditAPI = {
  // Get all audits with optional filters
  getAudits: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== 'All') {
        params.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/audits/?${params}`);
    return response.data;
  },

  // Get single audit by ID
  getAudit: async (auditId) => {
    const response = await api.get(`/audits/${auditId}`);
    return response.data;
  },

  // Create new audit
  createAudit: async (auditData) => {
    const response = await api.post('/audits/', auditData);
    return response.data;
  },

  // Update audit
  updateAudit: async (auditId, auditData) => {
    const response = await api.put(`/audits/${auditId}`, auditData);
    return response.data;
  },

  // Delete audit
  deleteAudit: async (auditId) => {
    const response = await api.delete(`/audits/${auditId}`);
    return response.data;
  },

  // Get audit summary
  getAuditSummary: async () => {
    const response = await api.get('/audits-summary');
    return response.data;
  }
};

export default api;