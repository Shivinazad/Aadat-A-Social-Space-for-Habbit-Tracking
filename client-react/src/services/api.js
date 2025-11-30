import axios from 'axios';

// Use environment variable for API URL
// In production (Render), it will use '/api' (same domain)
// In development, it will use 'http://localhost:3000/api'
const API_BASE_URL = import.meta.env.PROD 
  ? '/api'
  : 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/users/register', userData),
  login: (credentials) => api.post('/users/login', credentials),
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/profile', data),
  getAchievements: () => api.get('/users/me/achievements'),
  getStats: () => api.get('/stats/landing'),
  // getUserStats accepts optional id to fetch another user's stats
  getUserStats: (id) => id ? api.get(`/users/${id}/stats`) : api.get('/users/stats'),
  // Public user endpoints
  getUserById: (id) => api.get(`/users/${id}`),
  getUserAchievements: (id) => api.get(`/users/${id}/achievements`),
};

// Achievements API
export const achievementsAPI = {
  getAll: () => api.get('/achievements'),
};

// Habits API
export const habitsAPI = {
  getAll: () => api.get('/habits'),
  create: (habitData) => api.post('/habits', habitData),
  update: (id, habitData) => api.put(`/habits/${id}`, habitData),
  delete: (id) => api.delete(`/habits/${id}`),
};

// Posts API
export const postsAPI = {
  getAll: () => api.get('/posts'),
  getUserPosts: (userId) => api.get(`/posts/user/${userId}`),
  create: (postData) => api.post('/posts', postData),
  like: (postId) => api.post(`/posts/${postId}/like`),
  getCommunityStats: () => api.get('/posts/stats/community'),
};

// Leaderboard API
export const leaderboardAPI = {
  getTop: () => api.get('/leaderboard'),
};

// Notifications API
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markAllRead: () => api.put('/notifications/mark-read'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
};

// Invite API
export const inviteAPI = {
  sendInvite: (email) => api.post('/invite', { email }),
};

export default api;
