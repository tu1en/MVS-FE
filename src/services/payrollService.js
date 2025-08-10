import axiosInstance from '../config/axiosInstance';

/**
 * Service for payroll management operations
 */
class PayrollService {
  
  /**
   * Get payroll records for a specific month
   * @param {number} year - The year
   * @param {number} month - The month (1-12)
   * @param {number} page - Page number (default: 0)
   * @param {number} size - Page size (default: 20)
   * @returns {Promise} API response
   */
  static async getPayrollByMonth(year, month, page = 0, size = 20) {
    try {
      const response = await axiosInstance.get(`/payroll/month/${year}/${month}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching payroll for ${month}/${year}:`, error);
      throw error;
    }
  }

  /**
   * Get payroll records for a specific period
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @param {number} page - Page number
   * @param {number} size - Page size
   * @returns {Promise} API response
   */
  static async getPayrollByPeriod(startDate, endDate, page = 0, size = 20) {
    try {
      const response = await axiosInstance.get('/payroll/period', {
        params: { startDate, endDate, page, size }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching payroll for period ${startDate} to ${endDate}:`, error);
      throw error;
    }
  }

  /**
   * Generate bulk payroll for all staff using new TopCV system
   * @param {string} period - Pay period (YYYY-MM format)
   * @returns {Promise} API response
   */
  static async generateBulkPayroll(period) {
    try {
      const response = await axiosInstance.post('/payroll/generate/all', null, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Error generating bulk payroll:', error);
      throw error;
    }
  }

  /**
   * Generate payroll for a specific staff member using new TopCV system
   * @param {number} userId - User ID
   * @param {string} period - Pay period (YYYY-MM format)
   * @returns {Promise} API response
   */
  static async generatePayroll(userId, period) {
    try {
      const response = await axiosInstance.post(`/payroll/generate/user/${userId}`, null, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error(`Error generating payroll for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Preview payroll calculation for a staff member using new TopCV system
   * @param {number} userId - User ID
   * @param {string} period - Pay period (YYYY-MM format)
   * @returns {Promise} API response
   */
  static async previewPayroll(userId, period) {
    try {
      const response = await axiosInstance.get(`/payroll/preview/user/${userId}`, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error(`Error previewing payroll for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Generate payroll by contract type using new TopCV system
   * @param {string} contractType - Contract type (TEACHER, ACCOUNTANT, etc.)
   * @param {string} period - Pay period (YYYY-MM format)
   * @returns {Promise} API response
   */
  static async generatePayrollByContractType(contractType, period) {
    try {
      const response = await axiosInstance.post(`/payroll/generate/contract-type/${contractType}`, null, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error(`Error generating payroll for contract type ${contractType}:`, error);
      throw error;
    }
  }

  /**
   * Get payroll history for a user
   * @param {number} userId - User ID
   * @param {string} fromPeriod - From period (YYYY-MM)
   * @param {string} toPeriod - To period (YYYY-MM)
   * @returns {Promise} API response
   */
  static async getPayrollHistory(userId, fromPeriod, toPeriod) {
    try {
      const response = await axiosInstance.get(`/payroll/history/user/${userId}`, {
        params: { fromPeriod, toPeriod }
      });
      return response.data;
    } catch (error) {
      console.error(`Error getting payroll history for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get TopCV calculation example
   * @returns {Promise} API response
   */
  static async getTopCVExample() {
    try {
      const response = await axiosInstance.get('/payroll/topcv-example');
      return response.data;
    } catch (error) {
      console.error('Error getting TopCV example:', error);
      throw error;
    }
  }

  /**
   * Get payroll summary for a period
   * @param {string} startDate - Period start date
   * @param {string} endDate - Period end date
   * @returns {Promise} API response
   */
  static async getPayrollSummary(startDate, endDate) {
    try {
      const response = await axiosInstance.get('/payroll/summary', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching payroll summary:', error);
      throw error;
    }
  }

  /**
   * Get payroll records for a specific staff member
   * @param {number} staffId - Staff member ID
   * @param {number} page - Page number
   * @param {number} size - Page size
   * @returns {Promise} API response
   */
  static async getPayrollByStaff(staffId, page = 0, size = 10) {
    try {
      const response = await axiosInstance.get(`/payroll/staff/${staffId}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching payroll for staff ${staffId}:`, error);
      throw error;
    }
  }

  /**
   * Process a payroll record (mark as processed)
   * @param {number} payrollId - Payroll record ID
   * @returns {Promise} API response
   */
  static async processPayroll(payrollId) {
    try {
      const response = await axiosInstance.post(`/payroll/${payrollId}/process`);
      return response.data;
    } catch (error) {
      console.error(`Error processing payroll ${payrollId}:`, error);
      throw error;
    }
  }

  /**
   * Mark payroll record as paid
   * @param {number} payrollId - Payroll record ID
   * @returns {Promise} API response
   */
  static async markPayrollAsPaid(payrollId) {
    try {
      const response = await axiosInstance.post(`/payroll/${payrollId}/paid`);
      return response.data;
    } catch (error) {
      console.error(`Error marking payroll ${payrollId} as paid:`, error);
      throw error;
    }
  }

  /**
   * Get monthly payroll statistics
   * @param {number} year - The year
   * @param {number} month - The month
   * @returns {Promise} API response
   */
  static async getMonthlyStats(year, month) {
    try {
      const response = await axiosInstance.get(`/payroll/stats/${year}/${month}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching payroll stats for ${month}/${year}:`, error);
      throw error;
    }
  }

  /**
   * Generate detailed payroll report
   * @param {string} startDate - Report period start date
   * @param {string} endDate - Report period end date
   * @returns {Promise} API response
   */
  static async generateReport(startDate, endDate) {
    try {
      const response = await axiosInstance.get('/payroll/report', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error generating payroll report:', error);
      throw error;
    }
  }

  /**
   * Transform API payroll record to frontend format
   * @param {Object} record - API payroll record
   * @returns {Object} Transformed record
   */
  static transformPayrollRecord(record) {
    return {
      id: record.id,
      userId: record.staffId,
      fullName: record.staffName,
      email: record.staffEmail,
      department: record.department || 'Chưa xác định',
      contractType: record.totalTeachingHours && record.totalTeachingHours > 0 ? 'TEACHER' : 'STAFF',
      baseSalary: record.baseSalary,
      teachingHours: record.totalTeachingHours,
      totalWorkingHours: record.totalWorkingHours,
      hourlyRate: record.hourlyRate,
      deductions: record.totalDeductions,
      grossPay: record.grossPay,
      totalSalary: record.netPay,
      status: record.status === 'PROCESSED' ? 'PROCESSED' : 'PENDING',
      processedDate: record.processedAt ? record.processedAt.split('T')[0] : null,
      payPeriodStart: record.payPeriodStart,
      payPeriodEnd: record.payPeriodEnd,
      generatedAt: record.generatedAt
    };
  }

  /**
   * Find HR payroll by user and period (new HR module)
   * GET /api/hr/salary/payroll/user/{userId}?year&month
   */
  static async getHrPayrollForUserPeriod(userId, year, month) {
    try {
      const response = await axiosInstance.get(`/hr/salary/payroll/user/${userId}`, {
        params: { year, month }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  }

  /**
   * Calculate HR payroll for a user and period (creates if missing)
   * POST /api/hr/salary/calculate?userId&year&month
   */
  static async calculateHrPayroll(userId, year, month) {
    const response = await axiosInstance.post('/hr/salary/calculate', null, {
      params: { userId, year, month }
    });
    return response.data;
  }

  /**
   * Get detailed salary calculation breakdown for a payroll record
   * @param {number} payrollId - Payroll record ID  
   * @returns {Promise} API response
   */
  static async getSalaryCalculationDetails(payrollId) {
    try {
      console.log('📊 Getting salary calculation details for payrollId:', payrollId);
      console.log('📊 Request URL:', `/hr/salary/payroll/${payrollId}/details`);
      
      const response = await axiosInstance.get(`/hr/salary/payroll/${payrollId}/details`);
      
      console.log('📊 Salary calculation details response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error getting salary calculation details for payroll ${payrollId}:`, error);
      console.error('❌ Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });
      throw error;
    }
  }
}

export default PayrollService;