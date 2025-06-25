import React, { useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
  localStorage.removeItem('isAdminLoggedIn');
  localStorage.removeItem('adminId');
  navigate('/', { replace: true }); // replace history entry to prevent back button
};


  const cards = [
    { title: '📊 Dashboard', desc: 'Visualize complaint trends & resolution stats', path: '/admin/dashboard' },
    { title: '📨 Complaint Feed', desc: 'Monitor complaint activity like social media', path: '/admin/complaint-feed' },
    { title: '🛠 Manage Complaints', desc: 'Review, verify, or close user complaints', path: '/admin/manage-complaints' },
    { title: '👥 Manage Citizens', desc: 'View and terminate citizen accounts', path: '/admin/manage-citizens' },
    { title: '🛡 Create Authorities', desc: 'Register accounts for government bodies', path: '/admin/create-authorities' },
    { title: '📋 Verified Authorities', desc: 'Browse all approved authority profiles', path: '/admin/verified-authorities' },
    { title: '🔒 Security Settings', desc: 'Change admin password', path: '/admin/security-settings' },
  ];

  return (
    <div className="min-h-screen bg-rose-50">
      {/* Navigation */}
      <div className="w-full bg-gradient-to-r from-rose-100 via-rose-50 to-rose-200 px-6 py-4 shadow-md flex justify-between items-center relative">
        <h1 className="text-2xl font-bold text-rose-700 tracking-wide select-none">Nivaran</h1>
        
        <div className="flex items-center gap-3 text-rose-700 relative">
          <span className="hidden sm:inline font-medium text-sm sm:text-base">Welcome, Admin</span>
          
          {/* User Icon Button */}
          <button
            className="hover:text-rose-800 transition text-3xl focus:outline-none"
            title="Logout"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <FaUserCircle />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 top-12 bg-white border border-gray-200 shadow-lg rounded-md w-40 z-50">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-rose-100 text-gray-700 text-sm"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cards Section */}
      <div className="py-10 px-6 sm:px-12 lg:px-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {cards.map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 shadow-lg border border-rose-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer text-center"
              onClick={() => navigate(card.path)}
            >
              <h3 className="text-lg font-semibold text-rose-600 mb-2">{card.title}</h3>
              <p className="text-gray-600 text-sm">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
