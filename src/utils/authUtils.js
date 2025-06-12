/**
 * Utility functions for authentication
 */

/**
 * Check if user is actually logged in with valid token
 * @returns {boolean} true if user is logged in with valid token
 */
export const isUserLoggedIn = () => {
  const token = localStorage.getItem('token');
  const isValid = token && 
                  token.trim() !== '' && 
                  token !== 'null' && 
                  token !== 'undefined';
  
  if (!isValid) {
    // Clean up invalid tokens
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
  }
  
  return isValid;
};

/**
 * Get user role safely - only returns role if user is logged in
 * @returns {string|null} user role or null if not logged in
 */
export const getUserRole = () => {
  if (!isUserLoggedIn()) {
    return null;
  }
  
  return localStorage.getItem('role');
};

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('userId');
  localStorage.removeItem('email');
  localStorage.removeItem('user');
};

/**
 * Validate token format (basic validation)
 * @param {string} token 
 * @returns {boolean}
 */
export const isValidTokenFormat = (token) => {
  if (!token || typeof token !== 'string') return false;
  
  // Basic checks
  if (token.trim() === '' || token === 'null' || token === 'undefined') {
    return false;
  }
  
  // You can add more specific token validation here
  // For example, JWT format validation
  
  return true;
};
