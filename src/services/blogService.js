import axios from 'axios';
import API_CONFIG from '../config/api-config';

// Tạo axios instance với URL server backend
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL.replace('/api', ''), // Remove /api suffix for blogs endpoint
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
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

const API_URL = '/api/blogs';

/**
 * Get all blogs
 * @returns {Promise} Promise containing blog data
 */
export const getAllBlogs = async () => {
  try {
    const response = await apiClient.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw error;
  }
};

/**
 * Get published blogs only
 * @returns {Promise} Promise containing published blog data
 */
export const getPublishedBlogs = async () => {
  try {
    const response = await apiClient.get(`${API_URL}/published`);
    return response.data;
  } catch (error) {
    console.error('Error fetching published blogs:', error);
    throw error;
  }
};

/**
 * Get a single blog by ID
 * @param {number} id - Blog ID
 * @returns {Promise} Promise containing blog data
 */
export const getBlogById = async (id) => {
  try {
    const response = await apiClient.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching blog ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new blog
 * @param {Object} blogData - Blog data
 * @returns {Promise} Promise containing created blog data
 */
export const createBlog = async (blogData) => {
  try {
    const response = await apiClient.post(API_URL, blogData);
    return response.data;
  } catch (error) {
    console.error('Error creating blog:', error);
    throw error;
  }
};

/**
 * Update a blog
 * @param {number} id - Blog ID
 * @param {Object} blogData - Updated blog data
 * @returns {Promise} Promise containing updated blog data
 */
export const updateBlog = async (id, blogData) => {
  try {
    const response = await apiClient.put(`${API_URL}/${id}`, blogData);
    return response.data;
  } catch (error) {
    console.error(`Error updating blog ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a blog
 * @param {number} id - Blog ID
 * @returns {Promise} Promise resolving when blog is deleted
 */
export const deleteBlog = async (id) => {
  try {
    const response = await apiClient.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting blog ${id}:`, error);
    throw error;
  }
};

/**
 * Publish a blog
 * @param {number} id - Blog ID
 * @returns {Promise} Promise containing published blog data
 */
export const publishBlog = async (id) => {
  try {
    const response = await apiClient.put(`${API_URL}/${id}/publish`);
    return response.data;
  } catch (error) {
    console.error(`Error publishing blog ${id}:`, error);
    throw error;
  }
};

/**
 * Unpublish a blog
 * @param {number} id - Blog ID
 * @returns {Promise} Promise containing unpublished blog data
 */
export const unpublishBlog = async (id) => {
  try {
    const response = await apiClient.put(`${API_URL}/${id}/unpublish`);
    return response.data;
  } catch (error) {
    console.error(`Error unpublishing blog ${id}:`, error);
    throw error;
  }
};

/**
 * Search blogs by keyword
 * @param {string} keyword - Search keyword
 * @returns {Promise} Promise containing matching blog data
 */
export const searchBlogs = async (keyword) => {
  try {
    // Handle empty search
    if (!keyword || keyword.trim() === '') {
      // Return published blogs instead
      return await getPublishedBlogs();
    }
    
    // Properly encode the keyword for URL to handle Vietnamese characters
    const encodedKeyword = encodeURIComponent(keyword.trim());
    console.log(`Searching with encoded keyword: ${encodedKeyword}`);
    
    const response = await apiClient.get(`${API_URL}/search?keyword=${encodedKeyword}`, {
      // Increase timeout for search queries that might take longer
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json; charset=utf-8',
      }
    });
    
    // Validate response data
    if (!response.data) return [];
    console.log(`Search complete, found ${response.data.length} results`);
    return response.data;
  } catch (error) {
    console.error(`Error searching blogs with keyword "${keyword}":`, error);
    // Return empty array instead of throwing error to prevent UI crashes
    return [];
  }
};

/**
 * Get blogs by tag
 * @param {string} tag - Tag to search for
 * @returns {Promise} Promise containing matching blog data
 */
export const getBlogsByTag = async (tag) => {
  try {
    const response = await apiClient.get(`${API_URL}/tag/${tag}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching blogs with tag "${tag}":`, error);
    throw error;
  }
};

 