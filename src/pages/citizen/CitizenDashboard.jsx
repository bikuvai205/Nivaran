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
} from 'lucide-react';
import RegisterComplaint from './RegisterComplaint';

const CitizenDashboard = () => {
  const [citizen, setCitizen] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingComplaints, setPendingComplaints] = useState([
    { id: 1, user: 'User1', time: '6 Oct 2024 8:04 pm', content: 'Hello, this is a pending complaint.', votes: 38, userVote: 0 },
    { id: 2, user: 'User2', time: '5 Oct 2024 7:30 pm', content: 'Another issue that needs attention.', votes: 456, userVote: 0 },
    { id: 3, user: 'User3', time: '4 Oct 2024 6:15 pm', content: 'Problem with the system.', votes: 30, userVote: 0 },
  ]);

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

  // Vote handlers
  const handleVote = (id, direction) => {
    setPendingComplaints(prev =>
      prev.map(c => {
        if (c.id === id) {
          let newVotes = c.votes;
          let newUserVote = direction;
          if (c.userVote === direction) {
            newUserVote = 0;
            newVotes -= direction;
          } else {
            newVotes -= c.userVote;
            newVotes += direction;
          }
          return { ...c, votes: newVotes, userVote: newUserVote };
        }
        return c;
      })
    );
  };

  const handleSubmitSuccess = (newComplaint) => {
    setPendingComplaints(prev => [...prev, newComplaint]);
  };

  if (error) return <p className="text-red-600 text-center">{error}</p>;
  if (!citizen) return <p className="text-center">Loading dashboard...</p>;

  const handleTabChange = (tab) => setActiveTab(tab);

  const NavButton = ({ icon: Icon, label, tabKey }) => (
    <button
      onClick={() => handleTabChange(tabKey)}
      className={`flex items-center font-semibold transition-colors ${
        activeTab === tabKey ? 'text-rose-700' : 'text-rose-600 hover:text-rose-800'
      }`}
    >
      <Icon className="mr-2" size={20} />
      {label}
    </button>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'compose':
        return <RegisterComplaint citizen={citizen} onSubmitSuccess={handleSubmitSuccess} />;
      case 'pending':
       return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-rose-600 mb-6">Pending Complaints</h2>
          <div className="space-y-6">
            {pendingComplaints.map(complaint => (
              <div
                key={complaint.id}
                className="bg-gradient-to-br from-white to-rose-50 shadow-2xl rounded-2xl p-6 flex hover:shadow-rose-200 transition-all duration-300 border border-rose-100"
              >
                {/* Voting Section (left side, premium style) */}
                <div className="flex flex-col items-center mr-6 space-y-3">
                  <button
                    onClick={() => handleVote(complaint.id, 1)}
                    className={`p-2 rounded-full bg-rose-50 hover:bg-rose-100 transition-colors duration-200 ${
                      complaint.userVote === 1 ? 'text-rose-700' : 'text-gray-500'
                    }`}
                  >
                    <ArrowUp size={28} />
                  </button>
                  <span className="text-xl font-extrabold text-rose-800">{complaint.votes}</span>
                  <button
                    onClick={() => handleVote(complaint.id, -1)}
                    className={`p-2 rounded-full bg-rose-50 hover:bg-rose-100 transition-colors duration-200 ${
                      complaint.userVote === -1 ? 'text-rose-700' : 'text-gray-500'
                    }`}
                  >
                    <ArrowDown size={28} />
                  </button>
                </div>

                {/* Complaint Content */}
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-4 border-b border-rose-100 pb-2">
                    <span className="font-semibold text-rose-900 text-lg tracking-wide">{complaint.user}</span>
                    <span className="text-sm font-medium text-gray-600">{complaint.time}</span>
                  </div>

                  {/* Title + Description */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{complaint.title || "Complaint Title"}</h3>
                  <p className="text-gray-700 mb-6 text-base leading-relaxed">{complaint.content}</p>

                  {/* Optional Image (centered with premium styling) */}
                  {complaint.image && (
                    <div className="flex justify-center mb-6">
                      <img
                        src={complaint.image}
                        alt="Complaint"
                        className="rounded-2xl max-h-72 object-cover shadow-lg border border-rose-200 hover:shadow-rose-300 transition-shadow duration-300"
                      />
                    </div>
                  )}

                  {/* Voting Buttons at Bottom (premium style) */}
                  <div className="flex justify-end space-x-4 mt-auto">
                    <button
                      onClick={() => handleVote(complaint.id, 1)}
                      className={`px-4 py-2 rounded-xl font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors duration-200 ${
                        complaint.userVote === 1 ? 'opacity-100' : 'opacity-80'
                      }`}
                    >
                      Upvote
                    </button>
                    <button
                      onClick={() => handleVote(complaint.id, -1)}
                      className={`px-4 py-2 rounded-xl font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors duration-200 ${
                        complaint.userVote === -1 ? 'opacity-100' : 'opacity-80'
                      }`}
                    >
                      Downvote
                    </button>
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
            <h2 className="text-2xl font-bold text-rose-600 mb-4">In Progress Complaints</h2>
            <p className="text-gray-700">List of in-progress complaints would appear here.</p>
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
            <h2 className="text-2xl font-bold text-rose-600 mb-4">Resolved Complaints</h2>
            <p className="text-gray-700">List of resolved complaints would appear here.</p>
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
      <aside className="w-full md:w-64 bg-white shadow-xl p-6 flex flex-row md:flex-col justify-around md:justify-start items-center md:items-start space-x-4 md:space-x-0 md:space-y-4">
        <NavButton icon={Home} label="Home" tabKey="pending" />
        <NavButton icon={LayoutDashboard} label="Dashboard" tabKey="pending" />
        <NavButton icon={AlertCircle} label="Register a Complaint" tabKey="compose" />
        <NavButton icon={FileText} label="Complaints" tabKey="pending" />
      </aside>
      <main className="flex-1 p-4 md:p-8">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <nav className="flex border-b border-rose-200">
            {['pending', 'in-progress', 'resolved'].map(tab => (
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