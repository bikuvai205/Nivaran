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
  Menu,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import RegisterComplaint from "./RegisterComplaint";
import ComplaintFeed from "./ComplaintFeed";
import MyComplaints from "./MyComplaints";
import CitizenDashboardHome from "./CitizenDashboardHome";
import CitizenSetting from "./CitizenSetting";

const CitizenDashboard = () => {
  const [citizen, setCitizen] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [sidebarCollapsedDone, setSidebarCollapsedDone] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const token = localStorage.getItem("citizenToken");
  const navigate = useNavigate();

  // Fetch citizen info
  useEffect(() => {
  const fetchCitizen = async () => {
    if (!token) {
      // Redirect to login immediately if no token
      navigate("/");
      return;
    }

    try {
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
}, [token, navigate]);


  if (error) return <p className="text-red-600 text-center">{error}</p>;
  if (!citizen) return <p className="text-center">Loading dashboard...</p>;

  // Reusable Nav Button
  const NavButton = ({ icon: Icon, label, tabKey, showText = true }) => (
    <button
      onClick={() => setActiveTab(tabKey)}
      className={`flex items-center justify-center md:justify-start w-full px-3 py-2 rounded-lg font-semibold transition-colors ${
        activeTab === tabKey
          ? "bg-rose-200 text-rose-800"
          : "bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-800"
      }`}
    >
      <Icon className="mr-0 md:mr-2" size={20} />
      {showText && <span className="hidden md:inline">{label}</span>}
    </button>
  );

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("citizenToken");
    navigate("/");
  };

  // Content Renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <CitizenDashboardHome token={token} />;
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
      case "settings":
        return <CitizenSetting token={token} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-100 flex flex-col md:flex-row">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 bg-rose-50 shadow-xl p-6 flex-col space-y-4">
        <NavButton icon={LayoutDashboard} label="Dashboard" tabKey="dashboard" />
        <NavButton icon={FileText} label="Complaint Feed" tabKey="feed" />
        <NavButton icon={AlertCircle} label="Register Complaint" tabKey="compose" />
        <NavButton icon={FileText} label="My Complaints" tabKey="my" />
        <NavButton icon={Bell} label="Notifications" tabKey="notifications" />
      </aside>

      {/* Top Nav (Tablet & Mobile) */}
      <nav className="flex md:hidden bg-rose-50 shadow-md px-2 py-2">
        <div className="flex w-full justify-between items-center">
          <div className="flex flex-1 justify-evenly">
            <NavButton icon={LayoutDashboard} tabKey="dashboard" showText={false} />
            <NavButton icon={FileText} tabKey="feed" showText={false} />
            <NavButton icon={AlertCircle} tabKey="compose" showText={false} />
            <NavButton icon={Bell} tabKey="notifications" showText={false} />
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="ml-2 text-rose-600 hover:text-rose-800"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="absolute top-14 right-2 bg-white shadow-lg rounded-lg p-4 space-y-3 w-48 z-50">
            <div className="flex items-center text-rose-600 font-semibold">
              <User className="mr-2" size={20} />
              <span>{citizen.fullName}</span>
            </div>
            <button
              className="flex items-center w-full text-rose-600 hover:text-rose-800 font-semibold"
              onClick={() => {
                setActiveTab("settings");
                setMobileMenuOpen(false);
              }}
            >
              <Settings className="mr-2" size={20} />
              <span>Change Password</span>
            </button>
            <button
              className="flex items-center w-full text-rose-600 hover:text-rose-800 font-semibold"
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
            >
              <LogOut className="mr-2" size={20} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-auto">{renderTabContent()}</main>

      {/* Right Sidebar (Desktop) */}
      <aside
        className={`hidden md:flex bg-rose-50 shadow-xl p-4 flex-col 
          items-${sidebarCollapsed ? "center" : "start"} 
          space-y-4 transition-all duration-300 ease-in-out 
          ${sidebarCollapsed ? "w-20" : "w-64"}`}
        onTransitionEnd={() => setSidebarCollapsedDone(!sidebarCollapsed)}
      >
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="self-end text-rose-600 hover:text-rose-800"
        >
          {sidebarCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>

        <div
          className={`flex items-center text-rose-600 font-semibold transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? "justify-center" : ""
          }`}
        >
          <User className="mr-2" size={20} />
          {!sidebarCollapsed && sidebarCollapsedDone && <span>{citizen.fullName}</span>}
        </div>

        <button
          className={`flex items-center text-rose-600 hover:text-rose-800 font-semibold transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? "justify-center" : ""
          }`}
          onClick={() => setActiveTab("settings")}
        >
          <Settings className="mr-2" size={20} />
          {!sidebarCollapsed && sidebarCollapsedDone && <span>Change Password</span>}
        </button>

        <button
          className={`flex items-center text-rose-600 hover:text-rose-800 font-semibold transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? "justify-center" : ""
          }`}
          onClick={handleLogout}
        >
          <LogOut className="mr-2" size={20} />
          {!sidebarCollapsed && sidebarCollapsedDone && <span>Logout</span>}
        </button>
      </aside>
    </div>
  );
};

export default CitizenDashboard;
