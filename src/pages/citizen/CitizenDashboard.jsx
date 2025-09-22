import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  LayoutDashboard,
  FileText,
  AlertCircle,
  Bell,
  Settings,
  LogOut,
  User,
  Menu,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import RegisterComplaint from "./RegisterComplaint";
import ComplaintFeed from "./ComplaintFeed";
import MyComplaints from "./MyComplaints";
import CitizenDashboardHome from "./CitizenDashboardHome";
import CitizenSetting from "./CitizenSetting";
import Notifications from "./CitizenNotification";
import { io } from "socket.io-client";

const CitizenDashboard = () => {
  const [citizen, setCitizen] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const socketRef = useRef(null);
  const token = localStorage.getItem("citizenToken");
  const navigate = useNavigate();

  // Fetch citizen info
  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const fetchCitizen = async () => {
      try {
        const res = await axios.get(
          "https://nivaran-backend-zw9j.onrender.com/api/citizens/dashboard",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCitizen(res.data.citizen);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      }
    };

    fetchCitizen();
  }, [token, navigate]);

  // Initialize persistent socket
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("https://nivaran-backend-zw9j.onrender.com");

      socketRef.current.on("connect", () => {
        console.log("Socket connected:", socketRef.current.id);
        if (citizen?._id) socketRef.current.emit("join", citizen._id);
      });

      socketRef.current.on("disconnect", () => {
        console.log("Socket disconnected");
      });
    }

    // Join room when citizen is loaded
    if (citizen?._id && socketRef.current.connected) {
      socketRef.current.emit("join", citizen._id);
    }

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [citizen]);

  if (error)
    return <p className="text-red-600 text-center mt-8">{error}</p>;
  if (!citizen) return <p className="text-center mt-8">Loading dashboard...</p>;

  const NavButton = ({ icon: Icon, label, tabKey }) => (
    <button
      onClick={() => {
        setActiveTab(tabKey);
        setMobileMenuOpen(false);
      }}
      className={`flex items-center w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
        activeTab === tabKey
          ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md"
          : "text-rose-600 hover:bg-rose-100 hover:text-rose-700"
      } md:flex md:items-center md:w-full md:px-3 md:sm:px-4 md:py-2 md:sm:py-3 md:rounded-xl md:font-semibold md:text-sm md:sm:text-base md:transition-all md:duration-300 ${
        activeTab === tabKey
          ? "md:bg-gradient-to-r md:from-rose-500 md:to-pink-500 md:text-white md:shadow-md"
          : "md:text-rose-600 md:hover:bg-rose-100 md:hover:text-rose-700"
      }`}
    >
      <Icon size={18} className="mr-2 sm:mr-3 md:mr-2 md:sm:mr-3" />
      <span className="hidden md:inline">{label}</span>
    </button>
  );

  const handleLogout = () => {
    localStorage.removeItem("citizenToken");
    navigate("/");
  };

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
        return socketRef.current ? (
          <Notifications
            token={token}
            citizenId={citizen._id}
            socket={socketRef.current}
          />
        ) : (
          <p className="text-center mt-8">Connecting...</p>
        );
      case "settings":
        return <CitizenSetting token={token} />;
      default:
        return null;
    }
  };


  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-rose-50 via-white to-pink-50">
      {/* Mobile Navbar */}
{/* Mobile Navbar */}
<nav className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-30">
  <div className="flex items-center justify-between p-4">
    {/* Left: User Info */}
    <div className="flex items-center space-x-2 sm:space-x-4">
      <div className="bg-gradient-to-tr from-rose-400 to-pink-500 p-1 rounded-full shadow-md">
        <User size={18} className="text-white" />
      </div>
      <span className="font-bold text-sm text-rose-700 truncate sm:text-base">
        {citizen.fullName}
      </span>
    </div>

    {/* Right: Hamburger Menu */}
    <button
      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      className="p-2 text-rose-600 hover:text-rose-800"
    >
      {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  </div>

  {/* Horizontal Navigation Icons */}
 
<div className="flex justify-center space-x-3 px-2 pb-2">
  <NavButton icon={LayoutDashboard} label="Dashboard" tabKey="dashboard" small />
  <NavButton icon={FileText} label="Feed" tabKey="feed" small />
  <NavButton icon={AlertCircle} label="Compose" tabKey="compose" small />
  <NavButton icon={FileText} label="My Complaints" tabKey="my" small />
  <NavButton icon={Bell} label="Notifications" tabKey="notifications" small />
</div>


  {/* Mobile Menu Dropdown for Settings and Logout */}
  {mobileMenuOpen && (
    <div className="bg-white shadow-lg p-4">
      <div className="flex flex-col gap-2">
        <button
          onClick={() => {
            setActiveTab("settings");
            setMobileMenuOpen(false);
          }}
          className="flex items-center w-full px-3 py-2 rounded-xl text-rose-700 hover:bg-rose-100 hover:text-rose-800 font-semibold text-sm transition-all duration-300"
        >
          <Settings size={18} className="mr-2" /> Change Password
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 rounded-xl text-rose-700 hover:bg-rose-100 hover:text-rose-800 font-semibold text-sm transition-all duration-300"
        >
          <LogOut size={18} className="mr-2" /> Logout
        </button>
      </div>
    </div>
  )}
</nav>



      {/* Desktop Sidebar (unchanged) */}
      <aside className="hidden md:flex flex-col w-60 sm:w-64 md:w-72 bg-white rounded-r-3xl shadow-lg p-4 sm:p-6 fixed top-0 left-0 h-screen space-y-4 sm:space-y-6 z-20">
        <div className="flex items-center mb-4 sm:mb-6">
          <div className="bg-gradient-to-tr from-rose-400 to-pink-500 p-1 rounded-full shadow-md mr-3 sm:mr-4">
            <User size={20} className="text-white" />
          </div>
          <span className="font-bold text-base sm:text-lg md:text-xl text-rose-700 truncate">
            {citizen.fullName}
          </span>
        </div>

        <div className="flex flex-col gap-2 sm:gap-3">
          <NavButton
            icon={LayoutDashboard}
            label="Dashboard"
            tabKey="dashboard"
            active={activeTab === "dashboard"}
            onClick={setActiveTab}
          />
          <NavButton
            icon={FileText}
            label="Complaint Feed"
            tabKey="feed"
            active={activeTab === "feed"}
            onClick={setActiveTab}
          />
          <NavButton
            icon={AlertCircle}
            label="Register Complaint"
            tabKey="compose"
            active={activeTab === "compose"}
            onClick={setActiveTab}
          />
          <NavButton
            icon={FileText}
            label="My Complaints"
            tabKey="my"
            active={activeTab === "my"}
            onClick={setActiveTab}
          />
          <NavButton
            icon={Bell}
            label="Notifications"
            tabKey="notifications"
            active={activeTab === "notifications"}
            onClick={setActiveTab}
          />
        </div>

        <div className="mt-auto flex flex-col gap-2 sm:gap-3">
          <button
            onClick={() => setActiveTab("settings")}
            className="flex items-center w-full px-3 sm:px-4 py-2 rounded-xl text-rose-700 hover:bg-rose-100 hover:text-rose-800 font-semibold text-sm sm:text-base transition-all duration-300"
          >
            <Settings size={18} className="mr-2 sm:mr-3" /> Change Password
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 sm:px-4 py-2 rounded-xl text-rose-700 hover:bg-rose-100 hover:text-rose-800 font-semibold text-sm sm:text-base transition-all duration-300"
          >
            <LogOut size={18} className="mr-2 sm:mr-3" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 lg:p-10 md:ml-72 mt-16 md:mt-0">
        {renderTabContent()}
      </main>
    </div>
  );

};

export default CitizenDashboard;
