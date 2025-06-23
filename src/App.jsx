import React from 'react';
import LoginPage from './pages/LoginPage';
import './index.css'; import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/admin/HomePage';
import Dashboard from './pages/admin/Dashboard';
import ComplaintFeed from './pages/admin/ComplaintFeed';
import ManageComplaints from './pages/admin/ManageComplaints';
import ManageCitizens from './pages/admin/ManageCitizens';
import CreateAuthorities from './pages/admin/CreateAuthorities';
import VerifiedAuthorities from './pages/admin/VerifiedAuthorities';
import SecuritySettings from './pages/admin/SecuritySettings';


function App() {


  return (
    <>

      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
      <Route path="/admin/complaint-feed" element={<ComplaintFeed />} />
      <Route path="/admin/manage-complaints" element={<ManageComplaints />} />
      <Route path="/admin/manage-citizens" element={<ManageCitizens />} />
      <Route path="/admin/create-authorities" element={<CreateAuthorities />} />
      <Route path="/admin/verified-authorities" element={<VerifiedAuthorities />} />
      <Route path="/admin/security-settings" element={<SecuritySettings />} />
      </Routes>

    </>
  )
}

export default App
