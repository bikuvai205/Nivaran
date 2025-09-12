import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import axios from "axios";

const AuthorityDashboard = () => {
  const [activeTab, setActiveTab] = useState("incoming");
  const [authority, setAuthority] = useState({ username: "", email: "", name: "" });
  const [tasks, setTasks] = useState([]);

  // Fetch logged-in authority info
  useEffect(() => {
    const fetchAuthority = async () => {
      try {
        const token = localStorage.getItem("authorityToken");
        if (!token) return;

        const res = await axios.get("http://localhost:5000/api/authorities/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAuthority({
          username: res.data.username,
          email: res.data.email,
          name: res.data.name, // unit/office name
        });
      } catch (err) {
        console.error("Error fetching authority info:", err.response?.data || err);
      }
    };

    fetchAuthority();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authorityToken");
    window.location.reload(); // redirect to login page
  };

  return (
    <div className="h-screen flex flex-col bg-rose-50">
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 w-full bg-gradient-to-r from-rose-100 via-rose-50 to-rose-200 z-20 py-4 px-6 shadow-md flex justify-between items-center">
        <div>
          <p className="font-semibold text-rose-700">{authority.username || "Authority User"}</p>
          <p className="text-sm text-gray-600">{authority.email || "email@example.com"}</p>
        </div>
        <h2 className="text-2xl font-extrabold text-rose-700">Authority({authority.name || "Authority"})</h2>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg shadow-md transition"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      <div className="flex mt-20 h-full">
        {/* Left Sidebar */}
        <div className="w-64 bg-white rounded-2xl p-5 shadow-lg border border-rose-100 h-[calc(100vh-5rem)] space-y-4 fixed">
          {["incoming", "update", "logs"].map((tab) => (
            <button
              key={tab}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                activeTab === tab
                  ? "bg-rose-100 text-rose-700 shadow-inner"
                  : "bg-white text-gray-700 hover:bg-rose-50"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "incoming"
                ? "Incoming Tasks"
                : tab === "update"
                ? "Update Accepted Tasks"
                : "Logs"}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="ml-72 p-6 w-full overflow-y-auto max-h-[calc(100vh-5rem)] space-y-6">
          {activeTab === "incoming" && (
            <>
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    className="bg-white shadow-lg rounded-2xl border border-rose-100 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="px-6 pt-4">
                      <p className="font-semibold text-rose-600">{task.username}</p>
                      <h3 className="text-xl font-bold text-gray-900 mt-2">{task.title}</h3>
                      <p className="text-gray-700 mt-2">{task.description}</p>
                    </div>
                    {task.image && (
                      <div className="px-6 pb-4 flex justify-center mt-4">
                        <img
                          src={task.image}
                          alt={task.title}
                          className="max-h-[200px] w-auto object-contain rounded-xl shadow-md"
                        />
                      </div>
                    )}
                    <div className="flex justify-end px-6 pb-4 space-x-4">
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        Accept
                      </button>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        Reject
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-center text-gray-500">No tasks available.</p>
              )}
              {tasks.length > 0 && (
                <p className="text-sm text-gray-500 text-center mt-4">No more tasks</p>
              )}
            </>
          )}
          {activeTab === "update" && (
            <p className="text-center text-gray-500">Update Accepted Tasks content here.</p>
          )}
          {activeTab === "logs" && (
            <p className="text-center text-gray-500">Logs content here.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorityDashboard;
