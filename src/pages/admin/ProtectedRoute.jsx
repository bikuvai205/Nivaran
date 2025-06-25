import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';

  if (!isLoggedIn) {
    // If not logged in, redirect to login page
    return <Navigate to="/" replace />;
  }

  // If logged in, render the requested component/page
  return children;
};

export default ProtectedRoute;
