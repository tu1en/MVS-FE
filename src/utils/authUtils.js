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
  if (!role) return null;
  
  // Map numeric roles to string roles and vice versa
  const roleMap = {
    '0': 'ADMIN',
    '1': 'STUDENT',
    '2': 'TEACHER',
    '3': 'MANAGER'
  };

  // If it's a numeric role, return the string version
  if (roleMap[role]) {
    return roleMap[role];
  }
  
  // If it's a string role, make sure it's uppercase
  const upperRole = role.toUpperCase();
  if (['ADMIN', 'STUDENT', 'TEACHER', 'MANAGER'].includes(upperRole)) {
    return upperRole;
  }
  
  return null;
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
