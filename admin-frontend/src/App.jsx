import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './modules/user/pages/Home';
import Pricing from './modules/user/pages/Pricing';
import Enterprise from './modules/user/pages/Enterprise';
import Login from './modules/user/pages/Login';
import Dashboard from './modules/user/pages/Dashboard';
import PickPlan from './modules/user/pages/PickPlan';
import Signup from './modules/user/pages/Signup';
import Subscribe from './modules/user/pages/Subscribe';
import MerchantProtectedRoute from './modules/user/components/MerchantProtectedRoute';
import ForgotPassword from './modules/user/pages/ForgotPassword';
import StorefrontContainer from './modules/user/components/storefront/StorefrontContainer';

function App() {
  const [resolvedStore, setResolvedStore] = useState(null);
  const [checkingDomain, setCheckingDomain] = useState(true);
  const [isCustomDomain, setIsCustomDomain] = useState(false);

  useEffect(() => {
    const hostname = window.location.hostname;
    // Exclude localhost/system domains from custom domain lookup
    const isSystemDomain = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === 'admin.cloudedata.in' || hostname === 'storify.cloudedata.in';
    
    if (!isSystemDomain) {
      setIsCustomDomain(true);
      fetch(`${import.meta.env.VITE_STORE_API_URL}/stores/domain/resolve?domain=${hostname}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setResolvedStore(data.storeId);
          }
          setCheckingDomain(false);
        })
        .catch(err => {
          console.error('Domain resolution error:', err);
          setCheckingDomain(false);
        });
    } else {
      setCheckingDomain(false);
    }
  }, []);

  if (checkingDomain) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-950"></div>
      </div>
    );
  }

  if (isCustomDomain) {
    if (!resolvedStore) {
      return (
        <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center text-center p-6">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-sm font-black text-zinc-800 uppercase tracking-wider">Store Not Found</h1>
          <p className="text-xs text-zinc-400 mt-2 font-semibold max-w-xs leading-relaxed">This custom domain is not linked to any active online store on our platform.</p>
        </div>
      );
    }
    return (
      <Router>
        <Routes>
          <Route path="/*" element={<StorefrontContainer resolvedStoreId={resolvedStore} />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/enterprise" element={<Enterprise />} />
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/dashboard" element={
          <MerchantProtectedRoute>
            <Dashboard />
          </MerchantProtectedRoute>
        } />
        <Route path="/dashboard/plan" element={
          <MerchantProtectedRoute>
            <PickPlan />
          </MerchantProtectedRoute>
        } />
        <Route path="/dashboard/plan/subscribe" element={
          <MerchantProtectedRoute>
            <Subscribe />
          </MerchantProtectedRoute>
        } />
        <Route path="/dashboard/:tab/*" element={
          <MerchantProtectedRoute>
            <Dashboard />
          </MerchantProtectedRoute>
        } />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Customer Storefront Routes */}
        <Route path="/store/:storeId/*" element={<StorefrontContainer />} />
      </Routes>
    </Router>
  );
}

export default App;
