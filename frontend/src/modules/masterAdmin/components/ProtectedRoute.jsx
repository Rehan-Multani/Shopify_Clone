import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const adminInfo = localStorage.getItem('masterAdminInfo');

    if (!adminInfo) {
        return <Navigate to="/superadmin/login" replace />;
    }

    try {
        const parsedInfo = JSON.parse(adminInfo);
        if (parsedInfo.role !== 'master_admin') {
            return <Navigate to="/superadmin/login" replace />;
        }
    } catch (e) {
        return <Navigate to="/superadmin/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
