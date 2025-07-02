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
 * Get normalized role value to ensure consistency
 * @param {string} role - The role value
 * @returns {string} - Normalized role value
 */
export const getNormalizedRole = (role) => {
  if (role === undefined || role === null) return null;

  // Convert to string and trim
  let roleStr = String(role).trim();

  // Accept both number and string, any case
  switch (roleStr.toUpperCase()) {
    case '4':
    case 'ADMIN':
      return 'ADMIN';
    case '1':
    case 'STUDENT':
      return 'STUDENT';
    case '2':
    case 'TEACHER':
      return 'TEACHER';
    case '3':
    case 'MANAGER':
      return 'MANAGER';
    case '5':
    case 'ACCOUNTANT':
      return 'ACCOUNTANT';
    default:
      // fallback for typo: accountant (lowercase)
      if (roleStr.toLowerCase() === 'accountant') return 'ACCOUNTANT';
      return null;
  }
};

/**
 * Ensure role consistency in localStorage
 * @returns {string|null} The normalized role value or null if invalid
 */
export const ensureRoleConsistency = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  
  if (!token || !role) {
    return null;
  }
  
  const normalizedRole = getNormalizedRole(role);
  
  // If role is invalid, clean up
  if (!normalizedRole) {
    localStorage.removeItem('role');
    return null;
  }
  
  // Make sure the consistent version is stored in localStorage
  localStorage.setItem('role', normalizedRole);
  
  return normalizedRole;
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
