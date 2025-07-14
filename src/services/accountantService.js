import apiClient from '../utils/api';

/**
 * Accountant Service - Handles API calls for accountant-related functionality
 */
const accountantService = {
  /**
   * Get dashboard statistics for accountant
   * @returns {Promise<Object>} Dashboard statistics
   */
  getDashboardStats: async () => {
    try {
      const response = await apiClient.get('/accountant/dashboard-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching accountant dashboard stats:', error);
      throw error;
    }
  },

  /**
   * Get all invoices
   * @param {Object} params - Query parameters for filtering and pagination
   * @returns {Promise<Object>} List of invoices
   */
  getInvoices: async (params = {}) => {
    try {
      const response = await apiClient.get('/accountant/invoices', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  },

  /**
   * Get invoice details by ID
   * @param {number} invoiceId - Invoice ID
   * @returns {Promise<Object>} Invoice details
   */
  getInvoiceDetails: async (invoiceId) => {
    try {
      const response = await apiClient.get(`/accountant/invoices/${invoiceId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching details for invoice ${invoiceId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new invoice
   * @param {Object} invoiceData - Invoice data to be saved
   * @returns {Promise<Object>} Created invoice
   */
  createInvoice: async (invoiceData) => {
    try {
      const response = await apiClient.post('/accountant/invoices', invoiceData);
      return response.data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  },

  /**
   * Update an existing invoice
   * @param {number} invoiceId - Invoice ID
   * @param {Object} invoiceData - Updated invoice data
   * @returns {Promise<Object>} Updated invoice
   */
  updateInvoice: async (invoiceId, invoiceData) => {
    try {
      const response = await apiClient.put(`/accountant/invoices/${invoiceId}`, invoiceData);
      return response.data;
    } catch (error) {
      console.error(`Error updating invoice ${invoiceId}:`, error);
      throw error;
    }
  },

  /**
   * Delete an invoice
   * @param {number} invoiceId - Invoice ID
   * @returns {Promise<void>}
   */
  deleteInvoice: async (invoiceId) => {
    try {
      await apiClient.delete(`/accountant/invoices/${invoiceId}`);
    } catch (error) {
      console.error(`Error deleting invoice ${invoiceId}:`, error);
      throw error;
    }
  },

  /**
   * Get payment history
   * @param {Object} params - Query parameters for filtering and pagination
   * @returns {Promise<Object>} List of payments
   */
  getPayments: async (params = {}) => {
    try {
      const response = await apiClient.get('/accountant/payments', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },

  /**
   * Record a payment
   * @param {Object} paymentData - Payment data to be recorded
   * @returns {Promise<Object>} Recorded payment
   */
  recordPayment: async (paymentData) => {
    try {
      const response = await apiClient.post('/accountant/payments', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  },

  /**
   * Get student financial accounts
   * @param {Object} params - Query parameters for filtering and pagination
   * @returns {Promise<Object>} List of student accounts
   */
  getStudentAccounts: async (params = {}) => {
    try {
      const response = await apiClient.get('/accountant/student-accounts', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching student accounts:', error);
      throw error;
    }
  },

  /**
   * Get financial reports
   * @param {Object} params - Query parameters for report type and date range
   * @returns {Promise<Object>} Report data
   */
  getFinancialReports: async (params = {}) => {
    try {
      const response = await apiClient.get('/accountant/reports', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching financial reports:', error);
      throw error;
    }
  }
};

export default accountantService;
