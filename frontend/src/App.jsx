import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './modules/user/pages/Home';
import Pricing from './modules/user/pages/Pricing';
import Enterprise from './modules/user/pages/Enterprise';
import Login from './modules/user/pages/Login';
import Dashboard from './modules/user/pages/Dashboard';
import PickPlan from './modules/user/pages/PickPlan';
import Signup from './modules/user/pages/Signup';
import Subscribe from './modules/user/pages/Subscribe';
import MasterAdminPage from './modules/masterAdmin/pages/MasterAdminPage';
import MasterAdminLogin from './modules/masterAdmin/pages/MasterAdminLogin';
import ProtectedRoute from './modules/masterAdmin/components/ProtectedRoute';
import MerchantProtectedRoute from './modules/user/components/MerchantProtectedRoute';
import ForgotPassword from './modules/user/pages/ForgotPassword';


function App() {
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
        <Route path="/superadmin/login" element={<MasterAdminLogin />} />
        <Route path="/superadmin" element={
          <ProtectedRoute>
            <Navigate to="/superadmin/overview" replace />
          </ProtectedRoute>
        } />
        <Route path="/superadmin/:tab" element={
          <ProtectedRoute>
            <MasterAdminPage />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
