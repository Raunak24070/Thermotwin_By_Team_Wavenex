import axios from 'axios';

// Create central Axios instance
export const apiClient = axios.create({
  baseURL: '', // Uses Vite proxy to /api
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('thermotwin_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle 401 unauthenticated
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If we got a 401 on an authenticated endpoint (not during login check), clear token
      if (!error.config.url?.includes('/api/auth/login')) {
        localStorage.removeItem('thermotwin_token');
      }
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post('/api/auth/login', credentials);
    return res.data;
  },

  register: async (payload: {
    name: string;
    email: string;
    password: string;
    role?: 'STUDENT' | 'TEACHER' | 'ADMIN';
    institution?: string;
    department?: string;
    studentIdNumber?: string;
    teacherIdNumber?: string;
  }) => {
    const res = await apiClient.post('/api/auth/register', payload);
    return res.data;
  },

  getMe: async () => {
    const res = await apiClient.get('/api/auth/me');
    return res.data;
  },

  logout: async () => {
    try {
      const res = await apiClient.post('/api/auth/logout');
      return res.data;
    } finally {
      localStorage.removeItem('thermotwin_token');
    }
  }
};

// Experiment Data Types & API
export interface SavedExperiment {
  _id: string;
  id?: string;
  userId: string | { _id: string; name: string; email: string; institution?: string };
  experimentName: string;
  material: string;
  thermalConductivity: number;
  density: number;
  specificHeat: number;
  rodLength: number;
  rodDiameter: number;
  heaterVoltage: number;
  heaterPower: number;
  coolingWaterFlow: number;
  sensorReadings: {
    t1: number;
    t2: number;
    t3: number;
    t4: number;
    t5: number;
    t6: number;
    t7: number;
    t8: number;
    t9: number;
  };
  temperatureGradient: number;
  heatRemoved: number;
  experimentStatus: 'IN_PROGRESS' | 'STEADY_STATE' | 'COMPLETED' | 'SUBMITTED';
  observationsCount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const experimentApi = {
  getAll: async (): Promise<{ success: boolean; count: number; data: SavedExperiment[] }> => {
    const res = await apiClient.get('/api/experiments');
    return res.data;
  },

  getById: async (id: string): Promise<{ success: boolean; data: SavedExperiment }> => {
    const res = await apiClient.get(`/api/experiments/${id}`);
    return res.data;
  },

  create: async (payload: Partial<SavedExperiment>): Promise<{ success: boolean; data: SavedExperiment; message: string }> => {
    const res = await apiClient.post('/api/experiments', payload);
    return res.data;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete(`/api/experiments/${id}`);
    return res.data;
  }
};
