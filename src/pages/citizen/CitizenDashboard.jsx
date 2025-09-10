// src/pages/citizen/CitizenDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Home,
  LayoutDashboard,
  FileText,
  AlertCircle,
  Settings,
  LogOut,
  User,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import RegisterComplaint from "./RegisterComplaint";

const CitizenDashboard = () => {
  const [citizen, setCitizen] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [complaints, setComplaints] = useState([]);

  // Fetch citizen info
  useEffect(() => {
    const fetchCitizen = async () => {
      try {
        const token = localStorage.getItem("citizenToken");
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
  }, []);

  // Fetch complaints with userVote
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem("citizenToken");
        const res = await axios.get(
          "http://localhost:5000/api/complaints/pending",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const mapped = res.data.map((c) => {
          // find current user's vote from votes array
          const myVote =
            c.votes?.find((v) => v.user === citizen?._id)?.voteType || 0;

          return {
            id: c._id,
            user: c.anonymous ? "Anonymous" : c.user.fullName,
            time: new Date(c.createdAt).toLocaleString(),
            title: c.title,
            content: c.description,
            location: c.location || "N/A",
            severity: c.severity,
            upvotes: c.upvotes,
            downvotes: c.downvotes,
            userVote: myVote,
            image: c.image
              ? `http://localhost:5000/uploads/complaints/${c.image}`
              : null,
          };
        });
        setComplaints(mapped);
      } catch (err) {
        console.error("Fetch complaints error:", err);
      }
    };

    if (citizen?._id) {
      fetchComplaints();
    }
  }, [citizen?._id]);

  // Handle vote
 const handleVote = async (id, voteType) => {
  const token = localStorage.getItem("citizenToken");
  if (!token) return;

  try {
    // Optimistic UI update
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        let up = c.upvotes;
        let down = c.downvotes;

        // remove previous vote
        if (c.userVote === 1) up--;
        if (c.userVote === -1) down--;

        // toggle off if same vote
        if (c.userVote === voteType) {
          return { ...c, upvotes: up, downvotes: down, userVote: 0 };
        }

        // apply new vote
        if (voteType === 1) up++;
        if (voteType === -1) down++;

        return { ...c, upvotes: up, downvotes: down, userVote: voteType };
      })
    );

    // Sync with backend
    const res = await axios.post(
      `http://localhost:5000/api/complaints/${id}/vote`,
      { voteType },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Update with actual backend counts (to stay consistent)
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, ...res.data } : c
      )
    );
  } catch (err) {
    console.error("Vote error:", err);
  }
};


  const handleSubmitSuccess = (newComplaint) => {
    const mapped = {
      id: newComplaint._id || Date.now(),
      user: newComplaint.anonymous ? "Anonymous" : citizen.fullName,
      time: new Date(newComplaint.createdAt || Date.now()).toLocaleString(),
      title: newComplaint.title,
      content: newComplaint.description,
      location: newComplaint.location || "N/A",
      severity: newComplaint.severity,
      upvotes: 0,
      downvotes: 0,
      userVote: 0,
      image: newComplaint.image
        ? `http://localhost:5000/uploads/complaints/${newComplaint.image}`
        : null,
    };
    setComplaints((prev) => [...prev, mapped]);
    setActiveTab("pending");
  };

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
      case "compose":
        return (
          <RegisterComplaint
            citizen={citizen}
            onSubmitSuccess={handleSubmitSuccess}
          />
        );

      case "pending":
        return (
          <div className="p-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
            <h2 className="text-2xl font-bold text-rose-600 mb-6">
              Pending Complaints
            </h2>
            <div className="space-y-6">
              {complaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-shadow duration-300"
                >
                  <div className="px-6 pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-blue-800">
                        {complaint.user}
                      </span>
                      <div className="flex flex-col items-end text-sm text-gray-500">
                        <span>{complaint.time}</span>
                        {complaint.location && (
                          <div className="flex items-center mt-1">
                            <MapPin
                              size={16}
                              className="mr-1 text-rose-500 flex-shrink-0"
                            />
                            <span className="truncate max-w-[120px]">
                              {complaint.location}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {complaint.title}
                    </h3>
                    <hr className="border-gray-300 border-[1.2px] mb-3" />
                  </div>

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

                  {/* Votes */}
                  <div className="flex items-center space-x-6 px-6 py-3 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleVote(complaint.id, 1)}
                        className={`transition-colors ${
                          complaint.userVote === 1
                            ? "text-blue-600"
                            : "text-gray-400 hover:text-blue-600"
                        }`}
                      >
                        <ArrowUp
                          size={26}
                          strokeWidth={5}
                          fill={
                            complaint.userVote === 1 ? "currentColor" : "none"
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
                            ? "text-red-600"
                            : "text-gray-400 hover:text-red-600"
                        }`}
                      >
                        <ArrowDown
                          size={26}
                          strokeWidth={5}
                          fill={
                            complaint.userVote === -1 ? "currentColor" : "none"
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
      <main className="flex-1 p-4 md:p-8 overflow-auto">{renderTabContent()}</main>

      {/* Right Navbar */}
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
          {sidebarCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
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
