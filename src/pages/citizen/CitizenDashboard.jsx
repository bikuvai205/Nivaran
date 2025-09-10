// src/pages/citizen/CitizenDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Home,
  LayoutDashboard,
  FileText,
  AlertCircle,
  Settings,
  LogOut,
  User,
  ArrowUp,
  Clock,
  Image as ImageIcon,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import RegisterComplaint from './RegisterComplaint';

const CitizenDashboard = () => {
  const [citizen, setCitizen] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const [pendingComplaints, setPendingComplaints] = useState([
    {
      id: 1,
      user: 'User1',
      time: '6 Oct 2024 8:04 pm',
      title: 'Streetlight Not Working',
      content:
        'The streetlight near my house has been out for weeks. It’s unsafe for pedestrians.',
      upvotes: 0,
      downvotes: 0,
      userVote: 0,
      image:
        'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=800&q=80',
    },
    {
      id: 2,
      user: 'User2',
      time: '5 Oct 2024 7:30 pm',
      title: 'Garbage Issue',
      content:
        'Trash has not been collected for 3 days in our neighborhood. The smell is terrible.',
      upvotes: 0,
      downvotes: 0,
      userVote: 0,
      image:
        'https://images.unsplash.com/photo-1581578017423-3f87f1a86c5b?w=800&q=80',
    },
    {
      id: 3,
      user: 'User3',
      time: '4 Oct 2024 6:15 pm',
      title: 'Road Damage',
      content: 'Potholes on the main road are causing traffic and accidents.',
      upvotes: 0,
      downvotes: 0,
      userVote: 0,
      image:
        'https://images.unsplash.com/photo-1504215680853-026ed2a45def?w=800&q=80',
    },
  ]);

  useEffect(() => {
    const fetchCitizen = async () => {
      try {
        const token = localStorage.getItem('citizenToken');
        if (!token) {
          setError('No token found. Please log in again.');
          return;
        }
        const res = await axios.get(
          'http://localhost:5000/api/citizens/dashboard',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCitizen(res.data.citizen);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      }
    };
    fetchCitizen();
  }, []);

  // Vote handlers
  const handleVote = (id, voteType) => {
    setPendingComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;

        let up = c.upvotes;
        let down = c.downvotes;

        // Remove old vote if exists
        if (c.userVote === 1) up--;
        if (c.userVote === -1) down--;

        // If same vote clicked again → deselect
        if (c.userVote === voteType) {
          return { ...c, upvotes: up, downvotes: down, userVote: 0 };
        }

        // Apply new vote
        if (voteType === 1) up++;
        if (voteType === -1) down++;

        return { ...c, upvotes: up, downvotes: down, userVote: voteType };
      })
    );
  };

  const handleSubmitSuccess = (newComplaint) => {
    setPendingComplaints((prev) => [...prev, newComplaint]);
  };

  if (error) return <p className="text-red-600 text-center">{error}</p>;
  if (!citizen) return <p className="text-center">Loading dashboard...</p>;

  const handleTabChange = (tab) => setActiveTab(tab);

  const NavButton = ({ icon: Icon, label, tabKey }) => (
    <button
      onClick={() => handleTabChange(tabKey)}
      className={`flex items-center w-full px-3 py-2 rounded-lg font-semibold transition-colors ${
        activeTab === tabKey
          ? 'bg-rose-200 text-rose-800'
          : 'bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-800'
      }`}
    >
      <Icon className="mr-2" size={20} />
      {label}
    </button>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'compose':
        return (
          <RegisterComplaint
            citizen={citizen}
            onSubmitSuccess={handleSubmitSuccess}
          />
        );

      case 'pending':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-rose-600 mb-6">
              Pending Complaints
            </h2>
            <div className="space-y-6">
              {pendingComplaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-shadow duration-300"
                >
                  {/* Header */}
                  <div className="px-6 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-blue-800">
                        {complaint.user}
                      </span>
                      <span className="text-sm text-gray-500">
                        {complaint.time}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {complaint.title || 'Complaint Title'}
                    </h3>
                    <hr className="border-gray-300 border-[1.2px] mb-3" />
                  </div>

                  {/* Content */}
                  <div className="px-6 pb-4">
                    <p className="text-gray-700 mb-4">{complaint.content}</p>
                    {complaint.image && (
                      <div className="flex justify-center bg-gray-50 rounded-xl overflow-hidden">
                        <img
                          src={complaint.image}
                          alt="Complaint"
                          className="max-h-[500px] w-auto object-contain"
                        />
                      </div>
                    )}
                  </div>

                  {/* Voting */}
                  <div className="flex items-center space-x-6 px-6 py-3 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleVote(complaint.id, 1)}
                        className={`transition-colors ${
                          complaint.userVote === 1
                            ? 'text-blue-600'
                            : 'text-gray-400 hover:text-blue-600'
                        }`}
                      >
                        <ArrowUp
                          size={26}
                          strokeWidth={2.5}
                          fill={
                            complaint.userVote === 1 ? 'currentColor' : 'none'
                          }
                        />
                      </button>
                      <span className="font-semibold text-gray-700">
                        {complaint.upvotes}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleVote(complaint.id, -1)}
                        className={`transition-colors ${
                          complaint.userVote === -1
                            ? 'text-red-600'
                            : 'text-gray-400 hover:text-red-600'
                        }`}
                      >
                        <ArrowDown
                          size={26}
                          strokeWidth={2.5}
                          fill={
                            complaint.userVote === -1 ? 'currentColor' : 'none'
                          }
                        />
                      </button>
                      <span className="font-semibold text-gray-700">
                        {complaint.downvotes}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'in-progress':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-rose-600 mb-4">
              In Progress Complaints
            </h2>
            <p className="text-gray-700">
              List of in-progress complaints would appear here.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-rose-50 p-4 rounded-xl shadow flex flex-col items-center">
                <ImageIcon className="text-rose-600" size={24} />
                <p className="text-3xl font-bold text-rose-900">456.0</p>
                <p className="text-sm text-gray-600">Active Items</p>
              </div>
            </div>
          </div>
        );

      case 'resolved':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-rose-600 mb-4">
              Resolved Complaints
            </h2>
            <p className="text-gray-700">
              List of resolved complaints would appear here.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-rose-50 p-4 rounded-xl shadow flex flex-col items-center">
                <Clock className="text-rose-600" size={24} />
                <p className="text-3xl font-bold text-rose-900">30.0</p>
                <p className="text-sm text-gray-600">Completed Items</p>
              </div>
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
      <aside className="w-full md:w-64 bg-rose-50 shadow-xl p-6 flex flex-row md:flex-col justify-around md:justify-start items-center md:items-start space-x-4 md:space-x-0 md:space-y-4">
        <NavButton icon={Home} label="Home" tabKey="pending" />
        <NavButton icon={LayoutDashboard} label="Dashboard" tabKey="pending" />
        <NavButton
          icon={AlertCircle}
          label="Register a Complaint"
          tabKey="compose"
        />
        <NavButton icon={FileText} label="Complaints" tabKey="pending" />
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 md:p-8">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <nav className="flex border-b border-rose-200">
            {['pending', 'in-progress', 'resolved'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`flex-1 py-4 text-center font-semibold capitalize ${
                  activeTab === tab
                    ? 'text-rose-600 border-b-2 border-rose-600'
                    : 'text-gray-600 hover:text-rose-600'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </nav>
          {renderTabContent()}
        </div>
      </main>

      {/* Right Navbar */}
      <aside
        className={`bg-rose-50 shadow-xl p-4 flex flex-col items-${
          sidebarCollapsed ? 'center' : 'start'
        } space-y-4 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="self-end text-rose-600 hover:text-rose-800"
        >
          {sidebarCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>

        <div
          className={`flex items-center text-rose-600 font-semibold transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? 'justify-center' : ''
          }`}
        >
          <User className="mr-2" size={20} />
          {!sidebarCollapsed && <span>{citizen.fullName}</span>}
        </div>

        <button
          className={`flex items-center text-rose-600 hover:text-rose-800 font-semibold transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? 'justify-center' : ''
          }`}
        >
          <Settings className="mr-2" size={20} />
          {!sidebarCollapsed && <span>Change Password</span>}
        </button>

        <button
          className={`flex items-center text-rose-600 hover:text-rose-800 font-semibold transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="mr-2" size={20} />
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
      </aside>
    </div>
  );
};

export default CitizenDashboard;
