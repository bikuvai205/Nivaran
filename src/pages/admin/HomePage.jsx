import React from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const cards = [
    { title: '📊 Dashboard', desc: 'Visualize complaint trends & resolution stats', path: '/admin/dashboard' },
    { title: '📨 Complaint Feed', desc: 'Monitor complaint activity like social media', path: '/admin/complaint-feed' },
    { title: '🛠 Manage Complaints', desc: 'Review, verify, or close user complaints', path: '/admin/manage-complaints' },
    { title: '👥 Manage Citizens', desc: 'View and terminate citizen accounts', path: '/admin/manage-citizens' },
    { title: '🛡 Create Authorities', desc: 'Register accounts for government bodies', path: '/admin/create-authorities' },
    { title: '📋 Verified Authorities', desc: 'Browse all approved authority profiles', path: '/admin/verified-authorities' },
    { title: '🔒 Security Settings', desc: 'Change admin password or manage sessions', path: '/admin/security-settings' },
  ];

  return (
    <div className="min-h-screen bg-rose-50">
      {/* Navigation */}
      <div className="w-full bg-gradient-to-r from-rose-100 via-rose-50 to-rose-200 px-6 py-4 shadow-md flex justify-between items-center">
        <h1 className="text-2xl font-bold text-rose-700 tracking-wide select-none">Nivaran</h1>
        <div className="flex items-center gap-3 text-rose-700">
          <span className="hidden sm:inline font-medium text-sm sm:text-base">Welcome, Admin</span>
          <button
            className="hover:text-rose-800 transition text-3xl focus:outline-none"
            title="Profile / Logout"
            onClick={() => alert('Logout/Change Password logic coming soon')}
          >
            <FaUserCircle />
          </button>
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
