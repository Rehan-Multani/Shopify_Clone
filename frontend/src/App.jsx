import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './modules/user/pages/Home';
import Pricing from './modules/user/pages/Pricing';
import Enterprise from './modules/user/pages/Enterprise';
import Login from './modules/user/pages/Login';
import Dashboard from './modules/user/pages/Dashboard';
import PickPlan from './modules/user/pages/PickPlan';
import Signup from './modules/user/pages/Signup';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/enterprise" element={<Enterprise />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/plan" element={<PickPlan />} />
        <Route path="/dashboard/plan/subscribe" element={<Subscribe />} />
        <Route path="/dashboard/:tab/*" element={<Dashboard />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
