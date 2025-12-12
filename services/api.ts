import { Platform } from 'react-native';

// Windows Backend IP
const BACKEND_IP = '192.168.0.227';
const BACKEND_PORT = '3000';

// API Base URL
export const API_BASE_URL = `http://${BACKEND_IP}:${BACKEND_PORT}`;

// API Endpoints
export const API_ENDPOINTS = {
  // Health & Info
  health: `${API_BASE_URL}/health`,
  root: `${API_BASE_URL}/`,
  test: `${API_BASE_URL}/api/test`,

  // Auth
  login: `${API_BASE_URL}/api/auth/login`,
  register: `${API_BASE_URL}/api/auth/register`,
  me: `${API_BASE_URL}/api/auth/me`,
  profile: `${API_BASE_URL}/api/auth/profile`,

  // Projects
  projects: `${API_BASE_URL}/api/projects`,
  projectById: (id: string) => `${API_BASE_URL}/api/projects/${id}`,

  // Rooms
  roomsByProject: (projectId: string) => `${API_BASE_URL}/api/projects/${projectId}/rooms`,
  roomById: (id: string) => `${API_BASE_URL}/api/rooms/${id}`,

  // Defects
  defectsByProject: (projectId: string) => `${API_BASE_URL}/api/projects/${projectId}/defects`,
  defects: `${API_BASE_URL}/api/defects`,
  defectById: (id: string) => `${API_BASE_URL}/api/defects/${id}`,

  // Upload
  upload: `${API_BASE_URL}/api/upload`,
  uploadMultiple: `${API_BASE_URL}/api/upload/multiple`,
};

// Helper function for API calls
export const apiCall = async (url: string, options?: RequestInit) => {
  try {
    console.log(`🌐 API Call: ${url}`);
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ API Response:', data);
    return data;
  } catch (error) {
    console.error('❌ API Error:', error);
    throw error;
  }
};

// API Service
export const api = {
  // Health Check
  healthCheck: () => apiCall(API_ENDPOINTS.health),

  // Test
  test: () => apiCall(API_ENDPOINTS.test),

  // Auth
  login: (email: string, password: string) =>
    apiCall(API_ENDPOINTS.login, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // Projects
  getProjects: () => apiCall(API_ENDPOINTS.projects),

  getProjectById: (id: string) => apiCall(API_ENDPOINTS.projectById(id)),

  createProject: (projectData: any) =>
    apiCall(API_ENDPOINTS.projects, {
      method: 'POST',
      body: JSON.stringify(projectData),
    }),

  updateProject: (id: string, projectData: any) =>
    apiCall(API_ENDPOINTS.projectById(id), {
      method: 'PUT',
      body: JSON.stringify(projectData),
    }),

  deleteProject: (id: string) =>
    apiCall(API_ENDPOINTS.projectById(id), {
      method: 'DELETE',
    }),

  // Rooms
  getRoomsByProject: (projectId: string) =>
    apiCall(API_ENDPOINTS.roomsByProject(projectId)),

  getRoomById: (id: string) => apiCall(API_ENDPOINTS.roomById(id)),

  createRoom: (roomData: any) =>
    apiCall(`${API_BASE_URL}/api/rooms`, {
      method: 'POST',
      body: JSON.stringify(roomData),
    }),

  updateRoom: (id: string, roomData: any) =>
    apiCall(API_ENDPOINTS.roomById(id), {
      method: 'PUT',
      body: JSON.stringify(roomData),
    }),

  deleteRoom: (id: string) =>
    apiCall(API_ENDPOINTS.roomById(id), {
      method: 'DELETE',
    }),

  // Defects
  getDefectsByProject: (projectId: string) =>
    apiCall(API_ENDPOINTS.defectsByProject(projectId)),

  getDefectById: (id: string) => apiCall(API_ENDPOINTS.defectById(id)),

  createDefect: (defectData: any) =>
    apiCall(API_ENDPOINTS.defects, {
      method: 'POST',
      body: JSON.stringify(defectData),
    }),

  updateDefect: (id: string, defectData: any) =>
    apiCall(API_ENDPOINTS.defectById(id), {
      method: 'PUT',
      body: JSON.stringify(defectData),
    }),

  deleteDefect: (id: string) =>
    apiCall(API_ENDPOINTS.defectById(id), {
      method: 'DELETE',
    }),
};

export default api;
