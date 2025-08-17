import { Spin } from 'antd';
import React, { createContext, useContext, useEffect, useState } from 'react';
import ProfileDataService from '../services/profileDataService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to clear localStorage
  const clearLocalStorage = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
  };

  // Helper function to validate JWT format
  const isValidJWTFormat = (token) => {
    try {
      const parts = token.split('.');
      return parts.length === 3;
    } catch (error) {
      return false;
    }
  };

  // Helper function to check if token is expired (client-side)
  const isTokenExpired = (token) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;

      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      return payload.exp && payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // Assume expired if we can't parse
    }
  };

  useEffect(() => {
    const validateAndSetUser = async () => {
      console.log('AuthContext: Starting user validation...');

      try {
        // First try to get the consolidated user object
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        console.log('AuthContext: Retrieved from localStorage:', {
          hasUserData: !!userData,
          hasToken: !!token,
          tokenLength: token?.length
        });

        // If no token exists, clear everything and set loading to false
        if (!token || token.trim() === '' || token === 'null' || token === 'undefined') {
          console.log('AuthContext: No valid token found, clearing auth state');
          setUser(null);
          clearLocalStorage();
          setLoading(false);
          return;
        }

        // Validate token format (basic JWT structure check)
        if (!isValidJWTFormat(token)) {
          console.log('AuthContext: Invalid token format, clearing auth state');
          setUser(null);
          clearLocalStorage();
          setLoading(false);
          return;
        }

        // Check if token is expired (client-side check)
        if (isTokenExpired(token)) {
          console.log('AuthContext: Token expired, clearing auth state');
          setUser(null);
          clearLocalStorage();
          setLoading(false);
          return;
        }

        if (userData) {
          // If we have a user object, validate it has required fields
          try {
            const parsedUser = JSON.parse(userData);
            console.log('AuthContext: Parsed user data:', {
              hasToken: !!parsedUser.token,
              hasRole: !!parsedUser.role,
              hasId: !!parsedUser.id,
              role: parsedUser.role
            });

            if (parsedUser.token && parsedUser.role && parsedUser.id) {
              // Ensure role is properly formatted
              if (parsedUser.role && parsedUser.role.trim() && !parsedUser.role.startsWith('ROLE_')) {
                parsedUser.role = `ROLE_${parsedUser.role}`;
              } else if (!parsedUser.role || !parsedUser.role.trim() || parsedUser.role === 'ROLE_') {
                parsedUser.role = null;
              }
              console.log('AuthContext: Setting user from stored data:', parsedUser.role);
              setUser(parsedUser);
            } else {
              console.log('AuthContext: Invalid user data structure, clearing auth state');
              setUser(null);
              clearLocalStorage();
            }
          } catch (parseError) {
            console.error('AuthContext: Error parsing user data:', parseError);
            setUser(null);
            clearLocalStorage();
          }
        } else {
          // For backward compatibility, try to construct user from individual items
          const role = localStorage.getItem('role');
          const userId = localStorage.getItem('userId');
          const email = localStorage.getItem('email');

          console.log('AuthContext: Constructing user from individual items:', {
            hasRole: !!role,
            hasUserId: !!userId,
            role
          });

          if (token && role && userId) {
            // Ensure role is properly formatted
            const formattedRole = (role && role.startsWith('ROLE_')) ? role : 
                                  (role && role.trim()) ? `ROLE_${role}` : null;

            // If we have the essential user data, construct a user object
            const constructedUser = {
              token,
              role: formattedRole,
              id: userId,
              email: email || '',
              username: email || ''
            };

            console.log('AuthContext: Constructed user:', constructedUser.role);

            // Save the constructed user to localStorage for future use
            localStorage.setItem('user', JSON.stringify(constructedUser));
            setUser(constructedUser);
          } else {
            console.log('AuthContext: Incomplete user data, clearing auth state');
            setUser(null);
            clearLocalStorage();
          }
        }
      } catch (error) {
        console.error('AuthContext: Error during user validation:', error);
        setUser(null);
        clearLocalStorage();
      }

      // After basic validation, hydrate user details (fullName, avatar, etc.) from server
      const hydrateFromServer = async () => {
        try {
          const result = await ProfileDataService.fetchProfileWithFallback();
          const data = result?.data || null;
          if (!data) return;
          setUser((prev) => {
            if (!prev) return prev;
            const merged = {
              ...prev,
              fullName: data.fullName || data.name || prev.fullName,
              email: data.email || prev.email,
              username: data.username || prev.username,
              avatar: data.avatar || prev.avatar,
            };
            try {
              localStorage.setItem('user', JSON.stringify(merged));
            } catch (e) {
              // ignore storage errors
            }
            return merged;
          });
        } catch (e) {
          console.log('AuthContext: hydrateFromServer failed (non-blocking)');
        }
      };

      // Fire and forget hydration; do not block UI loading
      hydrateFromServer();

      console.log('AuthContext: User validation completed');
      setLoading(false);
    };

    validateAndSetUser();
  }, []);

  const login = (userData) => {
    console.log('AuthContext: Login called with userData:', userData);

    // Ensure role is properly formatted
    const formattedRole = (() => {
      if (!userData.role) return null;
      const upper = String(userData.role).toUpperCase();
      // accept numeric or string, and ensure ROLE_ prefix in context/localStorage
      const normalized = upper.replace('ROLE_', '');
      return `ROLE_${normalized}`;
    })();

    const formattedUserData = {
      ...userData,
      role: formattedRole
    };

    console.log('AuthContext: Formatted user data:', formattedUserData);

    // Store in context
    setUser(formattedUserData);

    // Store as consolidated object
    localStorage.setItem('user', JSON.stringify(formattedUserData));

    // For backward compatibility, also store individual items
    localStorage.setItem('token', formattedUserData.token);
    localStorage.setItem('role', formattedUserData.role);
    localStorage.setItem('userId', formattedUserData.id);
    if (formattedUserData.email) {
      localStorage.setItem('email', formattedUserData.email);
    }

    console.log('AuthContext: User logged in successfully');
  };

  const syncLoginState = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }

  const logout = () => {
    console.log('AuthContext: Logging out user');
    setUser(null);
    clearLocalStorage();
  };

  const value = {
    user,
    login,
    logout,
    loading,
    syncLoginState
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 