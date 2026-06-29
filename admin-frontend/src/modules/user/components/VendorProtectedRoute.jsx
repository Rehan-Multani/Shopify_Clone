import React from 'react';
import { Navigate } from 'react-router-dom';

const VendorProtectedRoute = ({ children }) => {
    const vendorInfo = localStorage.getItem('vendorInfo');
    const token = localStorage.getItem('vendorToken');

    if (!vendorInfo || !token) {
        return <Navigate to="/vendor/login" replace />;
    }

    try {
        const parsed = JSON.parse(vendorInfo);
        if (!parsed || !parsed.email) {
            return <Navigate to="/vendor/login" replace />;
        }
    } catch (e) {
        return <Navigate to="/vendor/login" replace />;
    }

    return children;
};

export default VendorProtectedRoute;
