/**
 * Utility functions for handling redirects based on user roles and authentication
 */

/**
 * Get the dashboard path based on user role
 * @param {string} role - User role (e.g., 'ROLE_STUDENT', 'STUDENT')
 * @returns {string} - Dashboard path
 */
export const getDashboardPathByRole = (role) => {
  if (!role) return '/login';

  // Normalize role (remove ROLE_ prefix if present)
  const normalizedRole = role.replace('ROLE_', '').toLowerCase();

  switch (normalizedRole) {
    case 'student':
      return '/student';
    case 'teacher':
      return '/teacher';
    case 'manager':
      return '/manager';
    case 'admin':
      return '/admin';
    case 'accountant':
      return '/accountant';
    case 'teaching_assistant':
      return '/teaching-assistant';
    case 'parent':
      return '/parent';
    default:
      console.warn('Unknown role:', role);
      return '/login';
  }
};

/**
 * Redirect user based on authentication status and role
 * @param {Object} options - Options object
 * @param {boolean} options.useNavigate - Whether to use React Router navigate (default: false)
 * @param {Function} options.navigate - React Router navigate function (required if useNavigate is true)
 * @param {boolean} options.forceRedirect - Whether to force redirect even if already on target path (default: false)
 */
export const redirectBasedOnAuth = (options = {}) => {
  const { useNavigate = false, navigate, forceRedirect = false } = options;

  // Immediate redirect without console logs for better performance
  try {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      if (useNavigate && navigate) {
        navigate('/login', { replace: true });
      } else {
        window.location.href = '/login';
      }
      return;
    }

    let user;
    try {
      user = JSON.parse(userData);
    } catch (error) {
      if (useNavigate && navigate) {
        navigate('/login', { replace: true });
      } else {
        window.location.href = '/login';
      }
      return;
    }

    const dashboardPath = getDashboardPathByRole(user.role);

    // Only check current path for React Router navigation
    if (useNavigate && !forceRedirect && window.location.pathname === dashboardPath) {
      return;
    }

    if (useNavigate && navigate) {
      navigate(dashboardPath, { replace: true });
    } else {
      window.location.href = dashboardPath;
    }

  } catch (error) {
    if (useNavigate && navigate) {
      navigate('/login', { replace: true });
    } else {
      window.location.href = '/login';
    }
  }
};

/**
 * Handle 404 errors by redirecting based on auth status
 * @param {Object} options - Options object
 * @param {boolean} options.useNavigate - Whether to use React Router navigate (default: false)
 * @param {Function} options.navigate - React Router navigate function
 */
export const handle404Redirect = (options = {}) => {
  console.log('Handling 404 redirect...');
  redirectBasedOnAuth(options);
};

/**
 * Handle 403 errors by redirecting to appropriate dashboard
 * @param {Object} options - Options object
 * @param {boolean} options.useNavigate - Whether to use React Router navigate (default: false)
 * @param {Function} options.navigate - React Router navigate function
 */
export const handle403Redirect = (options = {}) => {
  console.log('Handling 403 redirect...');
  redirectBasedOnAuth(options);
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if authenticated
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  return !!(token && userData);
};

/**
 * Get current user role
 * @returns {string|null} - User role or null if not authenticated
 */
export const getCurrentUserRole = () => {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) return null;

    const user = JSON.parse(userData);
    return user.role;
  } catch (error) {
    console.error('Error getting current user role:', error);
    return null;
  }
};
