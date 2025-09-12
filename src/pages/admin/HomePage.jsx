import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ListChecks,
  Users,
  ShieldPlus,
  UserCheck,
  Lock,
  LogOut,
  Rss
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminId');
    navigate('/', { replace: true });
  };

  const cards = [
    {
      title: 'Dashboard',
      desc: 'Interactive analytics and real-time complaint statistics.',
      path: '/admin/dashboard',
      icon: <LayoutDashboard className="w-10 h-10 text-rose-500 mb-4" />
    },
    {
      title: 'Feed',
      desc: 'Stay updated with live complaint activity.',
      path: '/admin/complaint-feed',
      icon: <Rss className="w-10 h-10 text-rose-500 mb-4" />
    },
    {
      title: 'Assign Authority',
      desc: 'Assign complaints to the right authorities.',
      path: '/admin/manage-complaints',
      icon: <ListChecks className="w-10 h-10 text-rose-500 mb-4" />
    },
    {
      title: 'Manage Citizens',
      desc: 'Oversee citizen accounts and maintain integrity.',
      path: '/admin/manage-citizens',
      icon: <Users className="w-10 h-10 text-rose-500 mb-4" />
    },
    {
      title: 'Create Authorities',
      desc: 'Register and empower government bodies.',
      path: '/admin/create-authorities',
      icon: <ShieldPlus className="w-10 h-10 text-rose-500 mb-4" />
    },
    {
      title: 'Verified Authorities',
      desc: 'Browse and manage approved authorities.',
      path: '/admin/verified-authorities',
      icon: <UserCheck className="w-10 h-10 text-rose-500 mb-4" />
    },
    {
      title: 'Change Password',
      desc: 'Keep your credentials secure.',
      path: '/admin/security-settings',
      icon: <Lock className="w-10 h-10 text-rose-500 mb-4" />
    }
  ];

  return (
    <div className="min-h-screen bg-rose-50">
      {/* Navigation */}
      <div className="w-full bg-gradient-to-r from-rose-100 via-rose-50 to-rose-200 px-6 py-4 shadow-md flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-rose-700 tracking-wide select-none">Nivaran</h1>

        <div className="flex items-center gap-6">
          <span className="hidden sm:inline font-medium text-sm sm:text-base text-rose-700">
            Welcome, Admin
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg shadow-md transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Cards Section */}
      <div className="py-12 px-6 sm:px-12 lg:px-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {cards.map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg border border-rose-100 hover:shadow-xl hover:scale-[1.03] transition-all duration-300 cursor-pointer text-center"
              onClick={() => navigate(card.path)}
            >
              {card.icon}
              <h3 className="text-xl font-bold text-rose-600 mb-3">{card.title}</h3>
              <p className="text-gray-600 text-sm">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
