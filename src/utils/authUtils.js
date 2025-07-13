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
  console.log('Raw role received:', role);
  
  if (role === undefined || role === null) {
    console.warn('Role is undefined or null');
    return null;
  }

  // Convert to string, trim, and handle case sensitivity
  const roleStr = String(role).trim().toUpperCase();
  console.log('Processing role:', roleStr);

  // Map all possible role values to their normalized form
  const roleMap = {
    // Number mappings
    '1': 'STUDENT',
    '2': 'TEACHER',
    '3': 'MANAGER',
    '4': 'ACCOUNTANT',
    '5': 'ADMIN',
    
    // Direct string mappings (uppercase)
    'STUDENT': 'STUDENT',
    'TEACHER': 'TEACHER',
    'MANAGER': 'MANAGER',
    'ACCOUNTANT': 'ACCOUNTANT',
    'ADMIN': 'ADMIN',
    
    // Common variations or typos
    'ACCOUNTING': 'ACCOUNTANT',
    'ADMINISTRATOR': 'ADMIN',
    'ADMINISTRATION': 'ADMIN',
    'ADMINISTRATIVE': 'ADMIN',
  };

  const normalizedRole = roleMap[roleStr] || null;
  
  if (!normalizedRole) {
    console.warn('Unrecognized role:', roleStr);
  } else {
    console.log('Normalized role to:', normalizedRole);
  }
  
  return normalizedRole;
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
