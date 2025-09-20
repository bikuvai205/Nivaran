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

  // Initialize persistent socket
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:5000");

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
      }`}
    >
      <Icon size={18} className="mr-2 sm:mr-3" />
      <span>{label}</span>
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
        // Only render Notifications if socket exists
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
      {/* Sidebar */}
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
          <NavButton icon={LayoutDashboard} label="Dashboard" tabKey="dashboard" />
          <NavButton icon={FileText} label="Complaint Feed" tabKey="feed" />
          <NavButton icon={AlertCircle} label="Register Complaint" tabKey="compose" />
          <NavButton icon={FileText} label="My Complaints" tabKey="my" />
          <NavButton icon={Bell} label="Notifications" tabKey="notifications" />
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
      <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 lg:p-10 md:ml-72">
        {renderTabContent()}
      </main>
    </div>
  );
};

export default CitizenDashboard;
