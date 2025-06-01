import axios from 'axios';
import { auth } from './firebase'; 


const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`; 

const api = axios.create({
  baseURL: API_BASE_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include Firebase auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Authentication error - user may need to log in');
      // You could dispatch a logout action here or redirect to login
    }
    return Promise.reject(error);
  }
);

// API service methods
export const apiService = {
  // Menu-related endpoints
  menu: {
    // Get all menu items with optional filters
    getAll: async (filters = {}) => {
      const params = new URLSearchParams();
      if (filters.dining_hall) params.append('dining_hall', filters.dining_hall);
      if (filters.meal_period) params.append('meal_period', filters.meal_period);
      if (filters.date) params.append('date', filters.date);
      
      const response = await api.get(`/menu?${params}`);
      return response.data;
    },

    // Search menu items
    search: async (query, filters = {}) => {
      const params = new URLSearchParams();
      params.append('query', query);
      if (filters.dining_hall) params.append('dining_hall', filters.dining_hall);
      if (filters.meal_period) params.append('meal_period', filters.meal_period);
      if (filters.date) params.append('date', filters.date);
      
      const response = await api.get(`/menu/search?${params}`);
      return response.data;
    },

    // Get menu item by ID
    getById: async (id) => {
      const response = await api.get(`/menu/${id}`);
      return response.data;
    },

    // Get available dates
    getAvailableDates: async () => {

      const response = await api.get('/menu/dates');
      return response.data;
    },

    getMenuByDate: async (date, mealTime = null, diningHall = null) => {
      const params = new URLSearchParams({ date });
      if (mealTime) params.append('mealTime', mealTime);
      if (diningHall) params.append('diningHall', diningHall);
      
      const response = await api.get(`/menu?${params.toString()}`);
      return response.data;
    },

    searchItems: async (searchParams) => {
      const queryParams = new URLSearchParams(searchParams).toString();
      const response = await api.get(`/menu/search?${queryParams}`);
      return response.data;
    },
  },

  // Meal plan related endpoints
  mealPlans: {
    // Generate a meal plan based on preferences
    generate: async (preferences) => {
      try {
        const response = await api.post('/mealplans/generate-test', preferences);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get user's meal plans (requires authentication)
    getUserPlans: async (params = {}) => {
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams ? `/mealplans?${queryParams}` : '/mealplans';
      const response = await api.get(url);
      return response.data;
    },

    // Get a specific meal plan by ID (requires authentication)
    getById: async (id) => {
      const response = await api.get(`/mealplans/${id}`);
      return response.data;
    },

    // Create a meal plan (requires authentication)
    create: async (mealPlan) => {
      const response = await api.post('/mealplans', mealPlan);
      return response.data;
    },

    // Save a generated meal plan (requires authentication)
    save: async (mealPlanData) => {
      const response = await api.post('/mealplans/save', mealPlanData);
      return response.data;
    },

    // Update a meal plan (requires authentication)
    update: async (id, updateData) => {
      const response = await api.put(`/mealplans/${id}`, updateData);
      return response.data;
    },

    // Delete a meal plan (requires authentication)
    delete: async (id) => {
      const response = await api.delete(`/mealplans/${id}`);
      return response.data;
    },

    // Search menu items for editing (requires authentication)
    searchMenuItems: async (params = {}) => {
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams ? `/menu/search?${queryParams}` : '/menu/search';
      const response = await api.get(url);
      return response.data;
    },
  },
};

// Helper function to handle API errors
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    console.error('API Error:', error.response.data);
    throw new Error(error.response.data.message || 'Server error occurred');
  } else if (error.request) {
    // Request was made but no response received
    console.error('Network Error:', error.request);
    throw new Error('Network error - please check your connection');
  } else {
    // Something else happened
    console.error('Error:', error.message);
    throw new Error('An unexpected error occurred');
  }
};

// Constants for the frontend
export const DINING_HALLS = [
  'Bruin Plate',
  'De Neve Dining',
  'Epicuria at Covel',
  'Spice Kitchen at Feast'
];

export const MEAL_PERIODS = [
  'breakfast',
  'lunch', 
  'dinner'
];

export default apiService; 