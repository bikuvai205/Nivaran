import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Home, LayoutDashboard, FileText, AlertCircle, Settings, LogOut, User, ArrowUp, Clock, ImageIcon } from 'lucide-react';

const CitizenDashboard = () => {
  const [citizen, setCitizen] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'pending':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-rose-600 mb-4">Pending Complaints</h2>
            <p className="text-gray-700">List of pending complaints would appear here.</p>
            {/* Placeholder for actual content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-rose-50 p-4 rounded-xl shadow flex flex-col items-center">
                <ArrowUp className="text-rose-600" size={24} />
                <p className="text-3xl font-bold text-rose-900">38.0</p>
                <p className="text-sm text-gray-600">Pending Items</p>
              </div>
              {/* Add more placeholders as needed */}
            </div>
          </div>
        );
      case 'in-progress':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-rose-600 mb-4">In Progress Complaints</h2>
            <p className="text-gray-700">List of in-progress complaints would appear here.</p>
            {/* Placeholder for actual content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-rose-50 p-4 rounded-xl shadow flex flex-col items-center">
                <ImageIcon className="text-rose-600" size={24} />
                <p className="text-3xl font-bold text-rose-900">456.0</p>
                <p className="text-sm text-gray-600">Active Items</p>
              </div>
              {/* Add more placeholders as needed */}
            </div>
          </div>
        );
      case 'resolved':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-rose-600 mb-4">Resolved Complaints</h2>
            <p className="text-gray-700">List of resolved complaints would appear here.</p>
            {/* Placeholder for actual content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-rose-50 p-4 rounded-xl shadow flex flex-col items-center">
                <Clock className="text-rose-600" size={24} />
                <p className="text-3xl font-bold text-rose-900">30.0</p>
                <p className="text-sm text-gray-600">Completed Items</p>
              </div>
              {/* Add more placeholders as needed */}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-100 flex flex-col md:flex-row">
      {/* Left Navbar */}
      <aside className="w-full md:w-64 bg-white shadow-xl p-6 flex flex-row md:flex-col justify-around md:justify-start items-center md:items-start space-x-4 md:space-x-0 md:space-y-4">
        <button className="flex items-center text-rose-600 hover:text-rose-800 font-semibold">
          <Home className="mr-2" size={20} />
          Home
        </button>
        <button className="flex items-center text-rose-600 hover:text-rose-800 font-semibold">
          <LayoutDashboard className="mr-2" size={20} />
          Dashboard
        </button>
        <button className="flex items-center text-rose-600 hover:text-rose-800 font-semibold">
          <AlertCircle className="mr-2" size={20} />
          Register a Complaint
        </button>
        <button className="flex items-center text-rose-600 hover:text-rose-800 font-semibold">
          <FileText className="mr-2" size={20} />
          Complaints
        </button>
      </aside>

      {/* Middle Body */}
      <main className="flex-1 p-4 md:p-8">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Top Navbar for Tabs */}
          <nav className="flex border-b border-rose-200">
            <button
              onClick={() => handleTabChange('pending')}
              className={`flex-1 py-4 text-center font-semibold ${activeTab === 'pending' ? 'text-rose-600 border-b-2 border-rose-600' : 'text-gray-600 hover:text-rose-600'}`}
            >
              Pending
            </button>
            <button
              onClick={() => handleTabChange('in-progress')}
              className={`flex-1 py-4 text-center font-semibold ${activeTab === 'in-progress' ? 'text-rose-600 border-b-2 border-rose-600' : 'text-gray-600 hover:text-rose-600'}`}
            >
              In Progress
            </button>
            <button
              onClick={() => handleTabChange('resolved')}
              className={`flex-1 py-4 text-center font-semibold ${activeTab === 'resolved' ? 'text-rose-600 border-b-2 border-rose-600' : 'text-gray-600 hover:text-rose-600'}`}
            >
              Resolved
            </button>
          </nav>

          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </main>

      {/* Right Navbar */}
      <aside className="w-full md:w-64 bg-white shadow-xl p-6 flex flex-row md:flex-col justify-around md:justify-start items-center md:items-start space-x-4 md:space-x-0 md:space-y-4">
        <div className="flex items-center text-rose-600 font-semibold mb-0 md:mb-4">
          <User className="mr-2" size={20} />
          {citizen.fullName}
        </div>
        <button className="flex items-center text-rose-600 hover:text-rose-800 font-semibold">
          <Settings className="mr-2" size={20} />
          Change Password
        </button>
        <button className="flex items-center text-rose-600 hover:text-rose-800 font-semibold">
          <LogOut className="mr-2" size={20} />
          Logout
        </button>
      </aside>
    </div>
  );
};

export default CitizenDashboard;