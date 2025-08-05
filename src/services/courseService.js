import API_CONFIG from '../config/api-config.js';
import apiClient from './apiClient';

const courseService = {
  /**
   * Get all available courses
   * @returns {Promise<Array>} List of courses
   */
  getAllCourses: () => {
    return apiClient.get('/courses');
  },

  /**
   * Get all course templates with optional filtering and pagination
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.size - Page size
   * @param {string} params.search - Search term
   * @param {string} params.subject - Subject filter
   * @param {string} params.status - Status filter
   * @returns {Promise<Object>} Paginated templates response
   */
  getAllTemplates: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.size !== undefined) queryParams.append('size', params.size);
    if (params.search) queryParams.append('search', params.search);
    if (params.subject) queryParams.append('subject', params.subject);
    if (params.status) queryParams.append('status', params.status);

    const url = `${API_CONFIG.ENDPOINTS.COURSE_TEMPLATES}${queryParams.toString() ? `?${queryParams}` : ''}`;
    return apiClient.get(url);
  },

  /**
   * Get course template by ID
   * @param {number} id - Template ID
   * @returns {Promise<Object>} Template details
   */
  getTemplateById: (id) => {
    return apiClient.get(API_CONFIG.ENDPOINTS.COURSE_TEMPLATES_BY_ID(id));
  },

  /**
   * Import course template from Excel file
   * @param {FormData} formData - Form data containing file and metadata
   * @returns {Promise<Object>} Import result
   */
  importFromExcel: (formData) => {
    return apiClient.post(API_CONFIG.ENDPOINTS.COURSE_TEMPLATES_IMPORT, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * Export course template to Excel
   * @param {number} id - Template ID
   * @returns {Promise<Blob>} Excel file blob
   */
  exportTemplate: (id) => {
    return apiClient.get(API_CONFIG.ENDPOINTS.COURSE_TEMPLATES_EXPORT(id), {
      responseType: 'blob'
    });
  },

  /**
   * Create new course template
   * @param {Object} templateData - Template data
   * @returns {Promise<Object>} Created template
   */
  createTemplate: (templateData) => {
    return apiClient.post(API_CONFIG.ENDPOINTS.COURSE_TEMPLATES, templateData);
  },

  /**
   * Update course template
   * @param {number} id - Template ID
   * @param {Object} templateData - Updated template data
   * @returns {Promise<Object>} Updated template
   */
  updateTemplate: (id, templateData) => {
    return apiClient.put(API_CONFIG.ENDPOINTS.COURSE_TEMPLATES_BY_ID(id), templateData);
  },

  /**
   * Delete course template
   * @param {number} id - Template ID
   * @returns {Promise<void>}
   */
  deleteTemplate: (id) => {
    return apiClient.delete(API_CONFIG.ENDPOINTS.COURSE_TEMPLATES_BY_ID(id));
  },

  /**
   * Search course templates
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Array>} Search results
   */
  searchTemplates: (searchParams) => {
    return apiClient.post(API_CONFIG.ENDPOINTS.COURSE_TEMPLATES_SEARCH, searchParams);
  },

  /**
   * Get template usage statistics
   * @param {number} id - Template ID
   * @returns {Promise<Object>} Usage statistics
   */
  getTemplateStats: (id) => {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.COURSE_TEMPLATES_BY_ID(id)}/stats`);
  },

  /**
   * Get all public courses available for enrollment
   * @returns {Promise<Array>} List of public courses
   */
  getPublicCourses: () => {
    return apiClient.get('/public/courses');
  },

  /**
   * Get public course detail by ID
   * @param {number} id - Course ID
   * @returns {Promise<Object>} Course details
   */
  getPublicCourseDetail: (id) => {
    return apiClient.get(`/public/courses/${id}`);
  }
  
};

export default courseService; 