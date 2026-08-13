import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './modules/user/pages/Home';
import Pricing from './modules/user/pages/Pricing';
import Enterprise from './modules/user/pages/Enterprise';
import Login from './modules/user/pages/Login';
import Signup from './modules/user/pages/Signup';
import MerchantProtectedRoute from './modules/user/components/MerchantProtectedRoute';
import ForgotPassword from './modules/user/pages/ForgotPassword';
import NotFound from './modules/user/pages/NotFound';
import VendorLogin from './modules/user/pages/VendorLogin';
import VendorProtectedRoute from './modules/user/components/VendorProtectedRoute';
import AboutUs from './modules/user/pages/AboutUs';
import ContactUs from './modules/user/pages/ContactUs';
import PrivacyPolicy from './modules/user/pages/PrivacyPolicy';
import RefundPolicy from './modules/user/pages/RefundPolicy';
import TermsAndConditions from './modules/user/pages/TermsAndConditions';

// Wave 5/6 — keep merchant/vendor/storefront shells out of the marketing path
const Dashboard = lazy(() => import('./modules/user/pages/Dashboard'));
const PickPlan = lazy(() => import('./modules/user/pages/PickPlan'));
const Subscribe = lazy(() => import('./modules/user/pages/Subscribe'));
const VendorDashboard = lazy(() => import('./modules/user/pages/VendorDashboard'));
const ThemePreviewPage = lazy(() => import('./modules/user/pages/ThemePreviewPage'));
const StorefrontContainer = lazy(() => import('./modules/user/components/storefront/StorefrontContainer'));

const RouteFallback = ({ label = 'Loading…' }) => (
  <div className="min-h-screen flex items-center justify-center text-sm text-zinc-500">{label}</div>
);

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
          <Route path="/*" element={
            <Suspense fallback={<RouteFallback label="Loading store…" />}>
              <StorefrontContainer resolvedStoreId={resolvedStore} />
            </Suspense>
          } />
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
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/dashboard" element={
          <MerchantProtectedRoute>
            <Suspense fallback={<RouteFallback label="Loading dashboard…" />}>
              <Dashboard />
            </Suspense>
          </MerchantProtectedRoute>
        } />
        <Route path="/dashboard/plan" element={
          <MerchantProtectedRoute>
            <Suspense fallback={<RouteFallback label="Loading plan…" />}>
              <PickPlan />
            </Suspense>
          </MerchantProtectedRoute>
        } />
        <Route path="/dashboard/plan/subscribe" element={
          <MerchantProtectedRoute>
            <Suspense fallback={<RouteFallback label="Loading…" />}>
              <Subscribe />
            </Suspense>
          </MerchantProtectedRoute>
        } />
        <Route path="/dashboard/store-preview/:storeId" element={
          <MerchantProtectedRoute>
            <Suspense fallback={<RouteFallback label="Loading preview…" />}>
              <ThemePreviewPage />
            </Suspense>
          </MerchantProtectedRoute>
        } />
        <Route path="/dashboard/:tab/*" element={
          <MerchantProtectedRoute>
            <Suspense fallback={<RouteFallback label="Loading dashboard…" />}>
              <Dashboard />
            </Suspense>
          </MerchantProtectedRoute>
        } />
        <Route path="/vendor/login" element={<VendorLogin />} />
        <Route path="/vendor/dashboard" element={
          <VendorProtectedRoute>
            <Suspense fallback={<RouteFallback label="Loading vendor dashboard…" />}>
              <VendorDashboard />
            </Suspense>
          </VendorProtectedRoute>
        } />
        <Route path="/vendor/dashboard/:tab/*" element={
          <VendorProtectedRoute>
            <Suspense fallback={<RouteFallback label="Loading vendor dashboard…" />}>
              <VendorDashboard />
            </Suspense>
          </VendorProtectedRoute>
        } />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/vendor/forgot-password" element={<ForgotPassword />} />
        
        {/* Customer Storefront Routes */}
        <Route path="/store/:storeId/*" element={
          <Suspense fallback={<RouteFallback label="Loading store…" />}>
            <StorefrontContainer />
          </Suspense>
        } />

        {/* 404 Catch-All Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
