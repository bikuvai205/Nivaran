import React from 'react';
import LoginPage from './pages/LoginPage';
import './index.css'; import { Routes, Route } from 'react-router-dom';

import AdminDashboard from './pages/AdminDashboard';

function App() {


  return (
    <>

      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>

    </>
  )
}

export default App
