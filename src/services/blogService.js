import axios from 'axios';

// Tạo axios instance với URL server backend
const apiClient = axios.create({
  baseURL: 'http://localhost:8088',
  headers: {
    'Content-Type': 'application/json'
  }
});

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
    const response = await apiClient.get(`${API_URL}/search?keyword=${keyword}`);
    return response.data;
  } catch (error) {
    console.error(`Error searching blogs with keyword "${keyword}":`, error);
    throw error;
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

/**
 * Get blogs by author
 * @param {number} authorId - Author ID
 * @returns {Promise} Promise containing matching blog data
 */
export const getBlogsByAuthor = async (authorId) => {
  try {
    const response = await apiClient.get(`${API_URL}/author/${authorId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching blogs by author ${authorId}:`, error);
    throw error;
  }
}; 