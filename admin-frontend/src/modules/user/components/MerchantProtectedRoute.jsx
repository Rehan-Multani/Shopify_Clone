import React from 'react';
import { Navigate } from 'react-router-dom';

const MerchantProtectedRoute = ({ children }) => {
    const merchantInfo = localStorage.getItem('merchantInfo');

    if (!merchantInfo) {
        return <Navigate to="/admin/login" replace />;
    }

    try {
        const parsed = JSON.parse(merchantInfo);
        if (!parsed || !parsed.email) {
            return <Navigate to="/admin/login" replace />;
        }
    } catch (e) {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
};

export default MerchantProtectedRoute;
