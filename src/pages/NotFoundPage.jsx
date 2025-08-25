import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handle404Redirect } from '../utils/redirectUtils';

const NotFoundPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect immediately without any delay or loading state
    handle404Redirect({
      useNavigate: true,
      navigate: navigate
    });
  }, [navigate]);

  // Return null or minimal content - user won't see this as redirect happens immediately
  return null;
};

export default NotFoundPage; 