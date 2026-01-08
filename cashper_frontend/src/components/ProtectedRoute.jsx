import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element, isAdmin = false }) => {
  // Check if user is authenticated
  const token = localStorage.getItem('access_token');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    // User is not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (isAdmin) {
    // For admin routes, check if user is admin
    try {
      const userData = JSON.parse(user);
      const isUserAdmin = userData.isAdmin === true || userData.role === 'admin';
      
      if (!isUserAdmin) {
        // User is not admin, redirect to dashboard
        return <Navigate to="/dashboard" replace />;
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
      return <Navigate to="/login" replace />;
    }
  }

  // User is authenticated and has appropriate permissions
  return element;
};

export default ProtectedRoute;
