// src/pages/authority/AuthorityDashboard.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthorityDashboard = () => {
  const navigate = useNavigate();
  const [authorityName, setAuthorityName] = useState('');
  const [authorityType, setAuthorityType] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // ✅ Check for token
    const token = localStorage.getItem('authorityToken');
    const name = localStorage.getItem('authorityName');
    const type = localStorage.getItem('authorityType');

    if (!token) {
      // 🚪 Redirect to login if no token
      navigate('/');
    } else {
      setAuthorityName(name);
      setAuthorityType(type);

      // Optional: verify token with backend
      axios.get('http://localhost:5000/api/authorities/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setMessage(res.data.message))
      .catch(err => {
        console.error(err);
        setMessage('Failed to fetch dashboard info.');
      });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authorityToken');
    localStorage.removeItem('authorityName');
    localStorage.removeItem('authorityType');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-rose-50 p-5">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-3xl text-center">
        <h1 className="text-3xl font-bold text-rose-700 mb-4">
          Welcome {authorityName}!
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          You are logged in as: <strong>{authorityType}</strong>
        </p>
        {message && <p className="text-gray-600 mb-6">{message}</p>}
        <button
          onClick={handleLogout}
          className="bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-md py-2 px-6"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AuthorityDashboard;
