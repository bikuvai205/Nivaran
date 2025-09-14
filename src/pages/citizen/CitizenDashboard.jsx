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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const token = localStorage.getItem("citizenToken");
  const navigate = useNavigate();

  // Fetch citizen info
  useEffect(() => {
    const fetchCitizen = async () => {
      if (!token) {
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

  if (error) return <p className="text-red-600 text-center mt-8">{error}</p>;
  if (!citizen) return <p className="text-center mt-8">Loading dashboard...</p>;

  const NavButton = ({ icon: Icon, label, tabKey }) => (
    <button
      onClick={() => {
        setActiveTab(tabKey);
        setMobileMenuOpen(false); // Close mobile menu on tab selection
      }}
      className={`flex items-center w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300
        ${
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
        return (
          <div className="p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-rose-600 mb-4 sm:mb-6">
              Notifications
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
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
    <div className="flex min-h-screen w-full bg-gradient-to-br from-rose-50 via-white to-pink-50 m-0 p-0">
      {/* Left Sidebar */}
      <aside className="hidden md:flex flex-col w-60 sm:w-64 md:w-72 bg-white rounded-r-3xl shadow-lg p-4 sm:p-6 fixed top-0 left-0 h-screen space-y-4 sm:space-y-6 z-20">
        <div className="flex items-center mb-4 sm:mb-6">
          <div className="bg-gradient-to-tr from-rose-400 to-pink-500 p-1 rounded-full shadow-md mr-3 sm:mr-4">
            <User size={20} className="text-white" />
          </div>
          <span className="font-bold text-base sm:text-lg md:text-xl text-rose-700 truncate">{citizen.fullName}</span>
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
            onClick={() => {
              setActiveTab("settings");
              setMobileMenuOpen(false);
            }}
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

      {/* Mobile Top Nav */}
      <nav className="md:hidden bg-white shadow-md fixed top-0 left-0 right-0 z-50 px-3 sm:px-4 py-2 flex justify-between items-center">
        <div className="flex gap-1 sm:gap-2 overflow-x-auto">
          <NavButton icon={LayoutDashboard} tabKey="dashboard" />
          <NavButton icon={FileText} tabKey="feed" />
          <NavButton icon={AlertCircle} tabKey="compose" />
          <NavButton icon={Bell} tabKey="notifications" />
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-rose-600">
          {mobileMenuOpen ? <X size={20} className="sm:w-6 sm:h-6" /> : <Menu size={20} className="sm:w-6 sm:h-6" />}
        </button>
        {mobileMenuOpen && (
          <div className="absolute top-12 right-2 bg-white shadow-xl rounded-2xl p-3 sm:p-4 space-y-2 sm:space-y-3 w-48 sm:w-56 z-50 animate-slide-down">
            <div className="flex items-center text-rose-600 font-semibold mb-2 text-sm sm:text-base">
              <User className="mr-2" size={16} />
              <span className="truncate">{citizen.fullName}</span>
            </div>
            <button
              className="flex items-center w-full text-rose-600 hover:text-rose-800 font-semibold text-sm sm:text-base"
              onClick={() => {
                setActiveTab("settings");
                setMobileMenuOpen(false);
              }}
            >
              <Settings className="mr-2" size={16} />
              <span>Change Password</span>
            </button>
            <button
              className="flex items-center w-full text-rose-600 hover:text-rose-800 font-semibold text-sm sm:text-base"
              onClick={handleLogout}
            >
              <LogOut className="mr-2" size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </nav>
    </div>
  );
};

export default CitizenDashboard;