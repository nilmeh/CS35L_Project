import axios from 'axios';

// Base URL for the backend API
const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
      const response = await api.get('/menu');
      const items = response.data;
      const dates = [...new Set(items.map(item => item.date))].sort();
      return dates;
    },
  },

  // Meal plan related endpoints
  mealPlans: {
    // Generate a meal plan based on preferences
    generate: async (preferences) => {
      console.log('🚀 API Service: Starting meal plan generation...');
      console.log('📋 Preferences being sent:', preferences);
      
      try {
        console.log('📡 Making POST request to:', '/mealplans/generate-test');
        const response = await api.post('/mealplans/generate-test', preferences);
        console.log('✅ API Service: Response received:', {
          status: response.status,
          dataKeys: Object.keys(response.data),
          hasMessage: !!response.data.message,
          hasMealPlan: !!response.data.mealPlan
        });
        return response.data;
      } catch (error) {
        console.error('❌ API Service: Error occurred:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        throw error;
      }
    },

    // Get user's meal plans (requires authentication)
    getUserPlans: async () => {
      const response = await api.get('/mealplans/user');
      return response.data;
    },

    // Create a meal plan (requires authentication)
    create: async (mealPlan) => {
      const response = await api.post('/mealplans', mealPlan);
      return response.data;
    },

    // Delete a meal plan (requires authentication)
    delete: async (id) => {
      const response = await api.delete(`/mealplans/${id}`);
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