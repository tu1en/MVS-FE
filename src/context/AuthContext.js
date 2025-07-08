import { Spin } from 'antd';
import React, { createContext, useContext, useEffect, useState } from 'react';

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

  useEffect(() => {
    // First try to get the consolidated user object
    const userData = localStorage.getItem('user');
    
    if (userData) {
      // If we have a user object, use it
      setUser(JSON.parse(userData));
    } else {
      // For backward compatibility, try to construct user from individual items
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      const userId = localStorage.getItem('userId');
      const email = localStorage.getItem('email');
      
      if (token && role && userId) {
        // If we have the essential user data, construct a user object
        const constructedUser = {
          token,
          role,
          id: userId,
          email: email || '',
          username: email || ''
        };
        
        // Save the constructed user to localStorage for future use
        localStorage.setItem('user', JSON.stringify(constructedUser));
        setUser(constructedUser);
      }
    }
    
    setLoading(false);
  }, []);

  const login = (userData) => {
    // Store in context
    setUser(userData);
    
    // Store as consolidated object
    localStorage.setItem('user', JSON.stringify(userData));
    
    // For backward compatibility, also store individual items
    localStorage.setItem('token', userData.token);
    localStorage.setItem('role', userData.role);
    localStorage.setItem('userId', userData.id);
    if (userData.email) {
      localStorage.setItem('email', userData.email);
    }
  };

  const syncLoginState = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
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