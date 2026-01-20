const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper to get auth token
const getToken = () => localStorage.getItem('devflix_token');

// Helper for API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

// Auth API
export const authApi = {
  login: async (email, password) => {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (result.token) {
      localStorage.setItem('devflix_token', result.token);
    }
    return result;
  },

  register: async (email, password) => {
    const result = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (result.token) {
      localStorage.setItem('devflix_token', result.token);
    }
    return result;
  },

  verifyToken: async () => {
    return apiRequest('/auth/verify');
  },

  logout: () => {
    localStorage.removeItem('devflix_token');
  },
};

// Instances API
export const instancesApi = {
  getAll: async () => {
    return apiRequest('/instances');
  },

  getBySlug: async (slug) => {
    return apiRequest(`/instances/slug/${slug}`);
  },

  getById: async (id) => {
    return apiRequest(`/instances/${id}`);
  },

  create: async (data) => {
    return apiRequest('/instances', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return apiRequest(`/instances/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id) => {
    return apiRequest(`/instances/${id}`, {
      method: 'DELETE',
    });
  },

  duplicate: async (id, newName, newSlug) => {
    return apiRequest(`/instances/${id}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ newName, newSlug }),
    });
  },
};

// Materials API
export const materialsApi = {
  getByInstance: async (instanceId) => {
    return apiRequest(`/materials/${instanceId}`);
  },

  updateByInstance: async (instanceId, materials) => {
    return apiRequest(`/materials/${instanceId}`, {
      method: 'PUT',
      body: JSON.stringify({ materials }),
    });
  },

  addMaterial: async (instanceId, classId, material) => {
    return apiRequest(`/materials/${instanceId}/${classId}`, {
      method: 'POST',
      body: JSON.stringify(material),
    });
  },

  deleteMaterial: async (instanceId, classId, itemId) => {
    return apiRequest(`/materials/${instanceId}/${classId}/${itemId}`, {
      method: 'DELETE',
    });
  },

  unlockMaterial: async (instanceId, classId, itemId) => {
    return apiRequest(`/materials/${instanceId}/${classId}/${itemId}/unlock`, {
      method: 'POST',
    });
  },

  lockMaterial: async (instanceId, classId, itemId) => {
    return apiRequest(`/materials/${instanceId}/${classId}/${itemId}/lock`, {
      method: 'POST',
    });
  },

  processScheduledUnlocks: async () => {
    return apiRequest('/materials/process-scheduled', {
      method: 'POST',
    });
  },
};

// Classes API
export const classesApi = {
  getByInstance: async (instanceId) => {
    return apiRequest(`/classes/${instanceId}`);
  },

  updateByInstance: async (instanceId, classes) => {
    return apiRequest(`/classes/${instanceId}`, {
      method: 'PUT',
      body: JSON.stringify({ classes }),
    });
  },

  addClass: async (instanceId, classData) => {
    return apiRequest(`/classes/${instanceId}`, {
      method: 'POST',
      body: JSON.stringify(classData),
    });
  },

  updateClass: async (instanceId, classId, classData) => {
    return apiRequest(`/classes/${instanceId}/${classId}`, {
      method: 'PUT',
      body: JSON.stringify(classData),
    });
  },

  deleteClass: async (instanceId, classId) => {
    return apiRequest(`/classes/${instanceId}/${classId}`, {
      method: 'DELETE',
    });
  },

  releaseClass: async (instanceId, classId) => {
    return apiRequest(`/classes/${instanceId}/${classId}/release`, {
      method: 'POST',
    });
  },
};

// Schedules API
export const schedulesApi = {
  getByInstance: async (instanceId) => {
    return apiRequest(`/schedules/${instanceId}`);
  },

  updateByInstance: async (instanceId, schedules) => {
    return apiRequest(`/schedules/${instanceId}`, {
      method: 'PUT',
      body: JSON.stringify({ schedules }),
    });
  },

  addSchedule: async (instanceId, schedule) => {
    return apiRequest(`/schedules/${instanceId}`, {
      method: 'POST',
      body: JSON.stringify(schedule),
    });
  },

  updateSchedule: async (instanceId, scheduleId, schedule) => {
    return apiRequest(`/schedules/${instanceId}/${scheduleId}`, {
      method: 'PUT',
      body: JSON.stringify(schedule),
    });
  },

  deleteSchedule: async (instanceId, scheduleId) => {
    return apiRequest(`/schedules/${instanceId}/${scheduleId}`, {
      method: 'DELETE',
    });
  },
};

export default {
  auth: authApi,
  instances: instancesApi,
  materials: materialsApi,
  classes: classesApi,
  schedules: schedulesApi,
};
