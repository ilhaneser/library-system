import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ user, loading, children }) => {
  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

export default PrivateRoute;