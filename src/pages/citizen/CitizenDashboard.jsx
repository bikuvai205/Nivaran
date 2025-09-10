// src/pages/citizen/CitizenDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LayoutDashboard,
  FileText,
  AlertCircle,
  Bell,
  Settings,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import RegisterComplaint from "./RegisterComplaint";
import ComplaintFeed from "./ComplaintFeed";
import MyComplaints from "./MyComplaints";

const CitizenDashboard = () => {
  const [citizen, setCitizen] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const token = localStorage.getItem("citizenToken");

  // Fetch citizen info
  useEffect(() => {
    const fetchCitizen = async () => {
      try {
        if (!token) return setError("No token found. Please log in again.");

        const res = await axios.get(
          "http://localhost:5000/api/citizens/dashboard",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCitizen(res.data.citizen);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      }
    };
    fetchCitizen();
  }, [token]);

  if (error) return <p className="text-red-600 text-center">{error}</p>;
  if (!citizen) return <p className="text-center">Loading dashboard...</p>;

  const NavButton = ({ icon: Icon, label, tabKey }) => (
    <button
      onClick={() => setActiveTab(tabKey)}
      className={`flex items-center w-full px-3 py-2 rounded-lg font-semibold transition-colors ${
        activeTab === tabKey
          ? "bg-rose-200 text-rose-800"
          : "bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-800"
      }`}
    >
      <Icon className="mr-2" size={20} />
      {label}
    </button>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-rose-600 mb-6">
              Dashboard Overview
            </h2>
            <p className="text-gray-600">
              📊 Here we will later add charts and analytics (bar chart, pie
              chart, timelines, etc.).
            </p>
          </div>
        );

      case "feed":
        return <ComplaintFeed citizen={citizen} token={token} />;

      case "compose":
        return <RegisterComplaint citizen={citizen} />;

      case "my":
        return <MyComplaints citizen={citizen} token={token} />;

      case "notifications":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-rose-600 mb-6">
              Notifications
            </h2>
            <p className="text-gray-600">
              🔔 Here we’ll display updates about complaint progress.
            </p>
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
        <NavButton icon={LayoutDashboard} label="Dashboard" tabKey="dashboard" />
        <NavButton icon={FileText} label="Complaint Feed" tabKey="feed" />
        <NavButton
          icon={AlertCircle}
          label="Register Complaint"
          tabKey="compose"
        />
        <NavButton icon={FileText} label="My Complaints" tabKey="my" />
        <NavButton icon={Bell} label="Notifications" tabKey="notifications" />
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 md:p-8 overflow-auto">{renderTabContent()}</main>

      {/* Right Sidebar */}
      <aside
        className={`bg-rose-50 shadow-xl p-4 flex flex-col items-${
          sidebarCollapsed ? "center" : "start"
        } space-y-4 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="self-end text-rose-600 hover:text-rose-800"
        >
          {sidebarCollapsed ? (
            <ChevronLeft size={20} />
          ) : (
            <ChevronRight size={20} />
          )}
        </button>

        <div
          className={`flex items-center text-rose-600 font-semibold transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? "justify-center" : ""
          }`}
        >
          <User className="mr-2" size={20} />
          {!sidebarCollapsed && <span>{citizen.fullName}</span>}
        </div>

        <button
          className={`flex items-center text-rose-600 hover:text-rose-800 font-semibold transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? "justify-center" : ""
          }`}
        >
          <Settings className="mr-2" size={20} />
          {!sidebarCollapsed && <span>Change Password</span>}
        </button>

        <button
          className={`flex items-center text-rose-600 hover:text-rose-800 font-semibold transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? "justify-center" : ""
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
