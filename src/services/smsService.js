import axiosInstance from '../config/axiosInstance';

const apiClient = axiosInstance;

/**
 * SMS Service
 * Handles all API calls related to SMS notifications and configuration
 */
class SMSService {
    
    /**
     * Get SMS statistics
     * @returns {Promise<Object>} SMS statistics
     */
    static async getSMSStatistics() {
        try {
            console.log('[SMS_SERVICE] Fetching SMS statistics');
            const response = await apiClient.get('/sms/statistics');
            console.log('[SMS_SERVICE] SMS statistics fetched:', response.data);
            return response.data;
        } catch (error) {
            console.error('[SMS_SERVICE] Error fetching SMS statistics:', error);
            throw this.handleError(error);
        }
    }
    
    /**
     * Get SMS service status
     * @returns {Promise<Object>} SMS service status
     */
    static async getSMSStatus() {
        try {
            console.log('[SMS_SERVICE] Checking SMS service status');
            const response = await apiClient.get('/sms/status');
            console.log('[SMS_SERVICE] SMS status fetched:', response.data);
            return response.data;
        } catch (error) {
            console.error('[SMS_SERVICE] Error checking SMS status:', error);
            throw this.handleError(error);
        }
    }
    
    /**
     * Test SMS sending
     * @param {string} phoneNumber - Phone number to test
     * @param {string} message - Test message
     * @returns {Promise<Object>} Test result
     */
    static async testSMS(phoneNumber, message) {
        try {
            console.log('[SMS_SERVICE] Testing SMS to:', phoneNumber);
            const response = await apiClient.post('/sms/test', {
                phoneNumber,
                message
            });
            console.log('[SMS_SERVICE] SMS test result:', response.data);
            return response.data;
        } catch (error) {
            console.error('[SMS_SERVICE] Error testing SMS:', error);
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
                case 500:
                    return new Error('Server Error: Please try again later');
                default:
                    return new Error(`Error: ${errorMessage}`);
            }
        } else if (error.request) {
            return new Error('Network Error: Please check your internet connection');
        } else {
            return new Error(`Error: ${error.message}`);
        }
    }
}

// Export individual functions for easier imports
export const getSMSStatistics = SMSService.getSMSStatistics.bind(SMSService);
export const getSMSStatus = SMSService.getSMSStatus.bind(SMSService);
export const testSMS = SMSService.testSMS.bind(SMSService);

export default SMSService;