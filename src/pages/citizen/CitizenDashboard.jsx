import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CitizenDashboard = () => {
  const [citizen, setCitizen] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCitizen = async () => {
      try {
        const token = localStorage.getItem('citizenToken');
        if (!token) {
          setError('No token found. Please log in again.');
          return;
        }

        const res = await axios.get('http://localhost:5000/api/citizens/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCitizen(res.data.citizen);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      }
    };

    fetchCitizen();
  }, []);

  if (error) return <p className="text-red-600 text-center">{error}</p>;
  if (!citizen) return <p className="text-center">Loading dashboard...</p>;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-rose-50 via-white to-rose-100">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-11/12 max-w-3xl">
        <h1 className="text-3xl font-bold text-rose-600 mb-4 text-center">
          Welcome, {citizen.fullName}! 🎉
        </h1>
        <p className="text-gray-700 text-center">Email: {citizen.email}</p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-rose-100 text-rose-900 shadow hover:shadow-md">
            <h2 className="font-semibold text-lg">📢 My Complaints</h2>
            <p className="text-sm">View and track your submitted complaints.</p>
          </div>
          <div className="p-6 rounded-xl bg-rose-100 text-rose-900 shadow hover:shadow-md">
            <h2 className="font-semibold text-lg">➕ Submit Complaint</h2>
            <p className="text-sm">Lodge a new complaint to authorities.</p>
          </div>
          <div className="p-6 rounded-xl bg-rose-100 text-rose-900 shadow hover:shadow-md">
            <h2 className="font-semibold text-lg">⚙️ Settings</h2>
            <p className="text-sm">Update your profile and password.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
