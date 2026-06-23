import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MasterAdminPage from './modules/masterAdmin/pages/MasterAdminPage';
import MasterAdminLogin from './modules/masterAdmin/pages/MasterAdminLogin';
import ProtectedRoute from './modules/masterAdmin/components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/superadmin" replace />} />
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
        <Route path="*" element={<Navigate to="/superadmin" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
