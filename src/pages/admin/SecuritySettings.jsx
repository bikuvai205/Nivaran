import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
const SecuritySettings = () => {
  const navigate = useNavigate();
  const [adminId] = useState('admin123'); // Replace with dynamic admin ID if using auth
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://nivaran-backend-zw9j.onrender.com/admin/change-password', {
        adminId,
        currentPassword,
        newPassword,
      });

      setMessage(res.data.message);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-rose-50 py-10 px-6">
      {/* Go Back */}
     <button
          onClick={() => navigate("/homepage")}
          className="p-2 mr-4 rounded-full hover:bg-rose-300 transition"
        >
          <ArrowLeft size={24} className="text-rose-700" />
        </button>

      {/* Form */}
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-xl font-bold text-rose-700 mb-4">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2 rounded-md"
          >
            Update Password
          </button>
        </form>

        {message && (
          <p className="text-center text-sm mt-4 text-rose-600 font-medium">{message}</p>
        )}
      </div>
    </div>
  );
};

export default SecuritySettings;
