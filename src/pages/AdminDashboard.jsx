import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-rose-50 p-10">
      <h1 className="text-3xl font-bold text-rose-700 mb-6">Admin Dashboard</h1>
      <p className="text-gray-700">Welcome, Admin. You have successfully logged in.</p>

      {/* You can list statistics, buttons, verified complaints, etc. here */}
    </div>
  );
};

export default AdminDashboard;
