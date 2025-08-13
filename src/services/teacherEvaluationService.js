import axiosInstance from '../config/axiosInstance';

const apiClient = axiosInstance;

/**
 * Teacher Evaluation Service
 * Handles all API calls related to teacher evaluations for Teaching Assistants
 */
class TeacherEvaluationService {
    
    /**
     * Create a new teacher evaluation
     * @param {Object} evaluationData - The evaluation data
     * @param {number} evaluationData.teacherId - ID of the teacher being evaluated
     * @param {number} evaluationData.classSessionId - ID of the class session
     * @param {number} evaluationData.teachingQualityScore - Score for teaching quality (1-5)
     * @param {number} evaluationData.studentInteractionScore - Score for student interaction (1-5)
     * @param {number} evaluationData.punctualityScore - Score for punctuality (1-5)
     * @param {string} evaluationData.comments - Optional comments
     * @returns {Promise<Object>} The created evaluation
     */
    static async createTeacherEvaluation(evaluationData) {
        try {
            console.log('[TEACHER_EVALUATION] Creating evaluation:', evaluationData);
            const response = await apiClient.post('/teacher-evaluations', evaluationData);
            console.log('[TEACHER_EVALUATION] Evaluation created successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('[TEACHER_EVALUATION] Error creating evaluation:', error);
            throw this.handleError(error);
        }
    }
    
    /**
     * Get all evaluations for a specific teacher
     * @param {number} teacherId - The teacher's ID
     * @returns {Promise<Array>} List of evaluations for the teacher
     */
    static async getTeacherEvaluations(teacherId) {
        try {
            console.log('[TEACHER_EVALUATION] Fetching evaluations for teacher:', teacherId);
            const response = await apiClient.get(`/teacher-evaluations/teacher/${teacherId}`);
            console.log('[TEACHER_EVALUATION] Evaluations fetched:', response.data);
            return response.data;
        } catch (error) {
            console.error('[TEACHER_EVALUATION] Error fetching teacher evaluations:', error);
            throw this.handleError(error);
        }
    }
    
    /**
     * Get average score for a teacher
     * @param {number} teacherId - The teacher's ID
     * @returns {Promise<number>} Average score for the teacher
     */
    static async getTeacherAverageScore(teacherId) {
        try {
            console.log('[TEACHER_EVALUATION] Fetching average score for teacher:', teacherId);
            const response = await apiClient.get(`/teacher-evaluations/teacher/${teacherId}/average`);
            console.log('[TEACHER_EVALUATION] Average score fetched:', response.data);
            return response.data;
        } catch (error) {
            console.error('[TEACHER_EVALUATION] Error fetching average score:', error);
            throw this.handleError(error);
        }
    }
    
    /**
     * Get evaluation statistics for a teacher
     * @param {number} teacherId - The teacher's ID
     * @returns {Promise<Object>} Evaluation statistics
     */
    static async getTeacherEvaluationStatistics(teacherId) {
        try {
            console.log('[TEACHER_EVALUATION] Fetching statistics for teacher:', teacherId);
            const response = await apiClient.get(`/teacher-evaluations/teacher/${teacherId}/statistics`);
            console.log('[TEACHER_EVALUATION] Statistics fetched:', response.data);
            return response.data;
        } catch (error) {
            console.error('[TEACHER_EVALUATION] Error fetching statistics:', error);
            throw this.handleError(error);
        }
    }
    
    /**
     * Get all evaluations made by the current user
     * @returns {Promise<Array>} List of evaluations made by the current user
     */
    static async getMyEvaluations() {
        try {
            console.log('[TEACHER_EVALUATION] Fetching my evaluations');
            const response = await apiClient.get('/teacher-evaluations/my-evaluations');
            console.log('[TEACHER_EVALUATION] My evaluations fetched:', response.data);
            return response.data;
        } catch (error) {
            console.error('[TEACHER_EVALUATION] Error fetching my evaluations:', error);
            throw this.handleError(error);
        }
    }
    
    /**
     * Get a specific evaluation by ID
     * @param {number} evaluationId - The evaluation ID
     * @returns {Promise<Object>} The evaluation
     */
    static async getEvaluationById(evaluationId) {
        try {
            console.log('[TEACHER_EVALUATION] Fetching evaluation:', evaluationId);
            const response = await apiClient.get(`/teacher-evaluations/${evaluationId}`);
            console.log('[TEACHER_EVALUATION] Evaluation fetched:', response.data);
            return response.data;
        } catch (error) {
            console.error('[TEACHER_EVALUATION] Error fetching evaluation:', error);
            throw this.handleError(error);
        }
    }
    
    /**
     * Update an existing evaluation
     * @param {number} evaluationId - The evaluation ID
     * @param {Object} evaluationData - Updated evaluation data
     * @returns {Promise<Object>} The updated evaluation
     */
    static async updateEvaluation(evaluationId, evaluationData) {
        try {
            console.log('[TEACHER_EVALUATION] Updating evaluation:', evaluationId, evaluationData);
            const response = await apiClient.put(`/teacher-evaluations/${evaluationId}`, evaluationData);
            console.log('[TEACHER_EVALUATION] Evaluation updated:', response.data);
            return response.data;
        } catch (error) {
            console.error('[TEACHER_EVALUATION] Error updating evaluation:', error);
            throw this.handleError(error);
        }
    }
    
    /**
     * Delete an evaluation (admin/manager only)
     * @param {number} evaluationId - The evaluation ID
     * @returns {Promise<void>}
     */
    static async deleteEvaluation(evaluationId) {
        try {
            console.log('[TEACHER_EVALUATION] Deleting evaluation:', evaluationId);
            await apiClient.delete(`/teacher-evaluations/${evaluationId}`);
            console.log('[TEACHER_EVALUATION] Evaluation deleted successfully');
        } catch (error) {
            console.error('[TEACHER_EVALUATION] Error deleting evaluation:', error);
            throw this.handleError(error);
        }
    }
    
    /**
     * Get all evaluations (admin/manager only)
     * @returns {Promise<Array>} All evaluations in the system
     */
    static async getAllEvaluations() {
        try {
            console.log('[TEACHER_EVALUATION] Fetching all evaluations');
            const response = await apiClient.get('/teacher-evaluations');
            console.log('[TEACHER_EVALUATION] All evaluations fetched:', response.data);
            return response.data;
        } catch (error) {
            console.error('[TEACHER_EVALUATION] Error fetching all evaluations:', error);
            throw this.handleError(error);
        }
    }
    
    /**
     * Handle API errors consistently
     * @param {Error} error - The error object
     * @returns {Error} Processed error
     */
    static handleError(error) {
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;
            const errorMessage = data?.message || data?.error || 'An error occurred';
            
            switch (status) {
                case 400:
                    return new Error(`Bad Request: ${errorMessage}`);
                case 401:
                    return new Error('Unauthorized: Please log in again');
                case 403:
                    return new Error('Forbidden: You do not have permission to perform this action');
                case 404:
                    return new Error('Not Found: The requested resource was not found');
                case 409:
                    return new Error('Conflict: This evaluation already exists');
                case 500:
                    return new Error('Server Error: Please try again later');
                default:
                    return new Error(`Error: ${errorMessage}`);
            }
        } else if (error.request) {
            // Request was made but no response received
            return new Error('Network Error: Please check your internet connection');
        } else {
            // Something else happened
            return new Error(`Error: ${error.message}`);
        }
    }
}

// Export individual functions for easier imports
export const createTeacherEvaluation = TeacherEvaluationService.createTeacherEvaluation.bind(TeacherEvaluationService);
export const getTeacherEvaluations = TeacherEvaluationService.getTeacherEvaluations.bind(TeacherEvaluationService);
export const getTeacherAverageScore = TeacherEvaluationService.getTeacherAverageScore.bind(TeacherEvaluationService);
export const getTeacherEvaluationStatistics = TeacherEvaluationService.getTeacherEvaluationStatistics.bind(TeacherEvaluationService);
export const getMyEvaluations = TeacherEvaluationService.getMyEvaluations.bind(TeacherEvaluationService);
export const getEvaluationById = TeacherEvaluationService.getEvaluationById.bind(TeacherEvaluationService);
export const updateEvaluation = TeacherEvaluationService.updateEvaluation.bind(TeacherEvaluationService);
export const deleteEvaluation = TeacherEvaluationService.deleteEvaluation.bind(TeacherEvaluationService);
export const getAllEvaluations = TeacherEvaluationService.getAllEvaluations.bind(TeacherEvaluationService);

export default TeacherEvaluationService;