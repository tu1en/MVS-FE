/**
 * Debug Logger Utility
 * Provides conditional logging based on environment and log levels
 */

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Current log level (can be set via environment variable)
const CURRENT_LOG_LEVEL = process.env.NODE_ENV === 'development' ? LOG_LEVELS.DEBUG : LOG_LEVELS.ERROR;

// Enable/disable specific component logging
// Reduced verbosity for successful operations as per user preference
const COMPONENT_LOGGING = {
  StudentAssignments: process.env.NODE_ENV === 'development',
  StudentGradesAttendance: process.env.NODE_ENV === 'development',
  TimetableView: process.env.NODE_ENV === 'development',
  AssignmentListTab: process.env.NODE_ENV === 'development'
};

// Reduce success logging verbosity - only log errors and warnings by default
const REDUCED_SUCCESS_LOGGING = true;

class DebugLogger {
  static shouldLog(level, component = null) {
    // Check log level
    if (level > CURRENT_LOG_LEVEL) {
      return false;
    }
    
    // Check component-specific logging
    if (component && COMPONENT_LOGGING.hasOwnProperty(component)) {
      return COMPONENT_LOGGING[component];
    }
    
    return true;
  }

  static error(message, data = null, component = null) {
    if (this.shouldLog(LOG_LEVELS.ERROR, component)) {
      console.error(`❌ ${component ? `[${component}] ` : ''}${message}`, data || '');
    }
  }

  static warn(message, data = null, component = null) {
    if (this.shouldLog(LOG_LEVELS.WARN, component)) {
      console.warn(`⚠️ ${component ? `[${component}] ` : ''}${message}`, data || '');
    }
  }

  static info(message, data = null, component = null) {
    // Reduce verbosity for successful operations
    if (this.shouldLog(LOG_LEVELS.INFO, component) && !REDUCED_SUCCESS_LOGGING) {
      console.log(`ℹ️ ${component ? `[${component}] ` : ''}${message}`, data || '');
    }
  }

  static debug(message, data = null, component = null) {
    // Only show debug messages in development mode
    if (this.shouldLog(LOG_LEVELS.DEBUG, component) && process.env.NODE_ENV === 'development') {
      console.log(`🔍 ${component ? `[${component}] ` : ''}${message}`, data || '');
    }
  }

  // Specific methods for common operations
  static apiCall(endpoint, method = 'GET', component = null) {
    // Only log API calls in development mode to reduce verbosity
    if (process.env.NODE_ENV === 'development') {
      this.debug(`API Call: ${method} ${endpoint}`, null, component);
    }
  }

  static apiSuccess(endpoint, dataLength = null, component = null) {
    // Reduced success logging - only show in development and when explicitly needed
    if (process.env.NODE_ENV === 'development' && !REDUCED_SUCCESS_LOGGING) {
      const lengthInfo = dataLength !== null ? ` (${dataLength} items)` : '';
      this.info(`API Success: ${endpoint}${lengthInfo}`, null, component);
    }
  }

  static apiError(endpoint, error, component = null) {
    this.error(`API Error: ${endpoint}`, error, component);
  }

  static stateChange(stateName, newValue, component = null) {
    this.debug(`State Change: ${stateName}`, newValue, component);
  }

  static userAction(action, data = null, component = null) {
    this.info(`User Action: ${action}`, data, component);
  }
}

export default DebugLogger;
