import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ user, loading, children }) => {
  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
};

export default AdminRoute;