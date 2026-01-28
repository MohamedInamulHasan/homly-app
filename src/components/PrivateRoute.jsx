import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const PrivateRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!user) {
        // Redirect to login but save the attempted url
        // We can use state to pass this information
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (adminOnly && user.role !== 'admin' && user.role !== 'store_admin') {
        // Redirect to home if user is not authorized
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PrivateRoute;
