/**
 * Utility functions for table data handling
 */

/**
 * Ensures the provided data is always an array for Table components
 * @param {*} data - Data that should be an array
 * @param {string} fallbackMessage - Optional message for debugging
 * @returns {Array} - Always returns an array
 */
export const ensureArray = (data, fallbackMessage = 'No data available') => {
  if (Array.isArray(data)) {
    return data;
  }
  
  if (data === null || data === undefined) {
    console.warn(`Table data is ${data === null ? 'null' : 'undefined'}: ${fallbackMessage}`);
    return [];
  }
  
  if (typeof data === 'object' && data.data) {
    return ensureArray(data.data, fallbackMessage);
  }
  
  console.warn(`Table data is not an array (${typeof data}): ${fallbackMessage}`, data);
  return [];
};

/**
 * Safe data source for Ant Design Tables
 * @param {*} rawData - Raw data from API or state
 * @param {string} componentName - Name of component for debugging
 * @returns {Array} - Safe array for Table dataSource
 */
export const safeDataSource = (rawData, componentName = 'Unknown') => {
  return ensureArray(rawData, `${componentName} component dataSource`);
};