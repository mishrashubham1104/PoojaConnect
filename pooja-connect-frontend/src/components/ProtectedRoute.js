import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  // If no token is found, redirect to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If token exists, show the requested page
  return children;
};

export default ProtectedRoute;