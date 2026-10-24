const API_BASE = (typeof window !== 'undefined' && window.location.hostname === 'localhost') 
  ? 'http://localhost:8080/api' 
  : `${import.meta.env.VITE_API_BASE_URL}/api`;

export const getAuthToken = () => localStorage.getItem('token');
export const setAuthToken = (token) => localStorage.getItem('token');

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If not FormData, default to application/json
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
      window.location.href = '/login';
    }
  }

  const contentType = response.headers.get('content-type');
  let data = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = (data && data.message) || (data && data.error) || response.statusText || 'An error occurred';
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Authentication
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),

  // Journal Entries
  createJournal: (entry) => request('/journals', { method: 'POST', body: JSON.stringify(entry) }),
  getJournals: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/journals${query ? `?${query}` : ''}`);
  },
  getJournalById: (id) => request(`/journals/${id}`),
  updateJournal: (id, entry) => request(`/journals/${id}`, { method: 'PUT', body: JSON.stringify(entry) }),
  deleteJournal: (id) => request(`/journals/${id}`, { method: 'DELETE' }),

  // Analytics & Insights
  getAnalyticsOverview: () => request('/analytics/overview'),
  getMoodTrends: (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return request(`/analytics/trends?${params.toString()}`);
  },
  getMoodCalendar: (year, month) => request(`/analytics/calendar?year=${year}&month=${month}`),

  // ML Training & Model Management
  uploadDataset: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/ml/datasets/upload', {
      method: 'POST',
      body: formData,
    });
  },
  getDatasets: () => request('/ml/datasets'),
  validateDataset: (datasetName, textColumn, labelColumn) => {
    return request(`/ml/datasets/${datasetName}/validate`, {
      method: 'POST',
      body: JSON.stringify({ text_column: textColumn, label_column: labelColumn }),
    });
  },
  trainModel: (payload) => {
    return request('/ml/train', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getModels: () => request('/ml/models'),
  activateModel: (modelId) => request(`/ml/models/${modelId}/activate`, { method: 'POST' }),
  predictMood: (text) => request('/ml/predict', { method: 'POST', body: JSON.stringify({ text }) }),
};
