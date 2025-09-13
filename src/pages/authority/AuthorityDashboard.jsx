// src/pages/authority/AuthorityDashboard.jsx
import React, { useState, useEffect } from "react";
import { MapPin, LogOut, X, Inbox, ClipboardCheck, FileClock } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthorityDashboard = () => {
  const [activeTab, setActiveTab] = useState("incoming");
  const [authority, setAuthority] = useState({ username: "", email: "", name: "" });
  const [incomingTasks, setIncomingTasks] = useState([]);
  const [acceptedTasks, setAcceptedTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [viewingLog, setViewingLog] = useState(null);

  const token = localStorage.getItem("authorityToken");
  const navigate = useNavigate();

  // ✅ Force redirect if no token (extra safety, aside from private route)
  useEffect(() => {
    if (!token) {
      navigate("/authority/login", { replace: true });
    }
  }, [token, navigate]);

  // Fetch authority info
  useEffect(() => {
    const fetchAuthority = async () => {
      if (!token) return;
      try {
        const res = await axios.get("http://localhost:5000/api/authorities/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAuthority({
          username: res.data.username,
          email: res.data.email,
          name: res.data.name,
        });
      } catch (err) {
        console.error("Error fetching authority info:", err.response?.data || err);
      }
    };
    fetchAuthority();
  }, [token]);

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      if (!token) return;
      try {
        const res = await axios.get("http://localhost:5000/api/complaints/assigned", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allTasks = res.data || [];
        setIncomingTasks(allTasks.filter(t => t.status === "assigned"));
        setAcceptedTasks(allTasks.filter(t => t.status === "inprogress"));
        setLogs(allTasks.filter(t => t.status === "resolved"));
      } catch (err) {
        console.error("Error fetching tasks:", err.response?.data || err);
      }
    };
    fetchTasks();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("authorityToken");
    navigate("/", { replace: true });
  };

  const handleAccept = async (complaintId) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/complaints/${complaintId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      const accepted = incomingTasks.find(t => t._id === complaintId);
      setAcceptedTasks(prev => [...prev, { ...accepted, status: "inprogress" }]);
      setIncomingTasks(prev => prev.filter(t => t._id !== complaintId));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to accept task");
    }
  };

  const handleReject = async (complaintId) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/complaints/${complaintId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      setIncomingTasks(prev => prev.filter(t => t._id !== complaintId));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to reject task");
    }
  };

  const handleMarkResolved = async (complaintId) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/complaints/${complaintId}/resolve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      const resolved = acceptedTasks.find(t => t._id === complaintId);
      setLogs(prev => [...prev, { ...resolved, status: "resolved", solvedAt: new Date().toISOString() }]);
      setAcceptedTasks(prev => prev.filter(t => t._id !== complaintId));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to mark resolved");
    }
  };

  const renderTaskCard = (task, type) => (
    <div
      key={task._id}
      className="bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden transition hover:shadow-xl"
    >
      <div className="px-6 pt-4">
        <div className="flex justify-between items-center mb-2 text-gray-500 text-sm">
          <span>Posted: {new Date(task.createdAt).toLocaleString()}</span>
          <span>Assigned: {task.assignedAt ? new Date(task.assignedAt).toLocaleString() : "-"}</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">{task.title}</h3>
        <div className="flex items-center text-sm text-gray-500 mt-1">
          <MapPin size={16} className="mr-1 text-rose-500" />
          <span>{task.location || "N/A"}</span>
        </div>
        <hr className="border-gray-300 border-[1.2px] mb-3 mt-3" />
      </div>
      <div className="px-6 pb-4">
        <p className="text-gray-700">{task.description}</p>
        {task.image && (
          <img
            src={`http://localhost:5000/uploads/complaints/${task.image}`}
            alt={task.title}
            className="mt-3 rounded-lg max-h-64 object-contain"
          />
        )}
      </div>
      <div className="px-6 py-3 bg-gray-50 border-t flex justify-end gap-4">
        {type === "incoming" ? (
          <>
            <button
              onClick={() => handleAccept(task._id)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              disabled={task.status === "inprogress"}
            >
              Accept
            </button>
            <button
              onClick={() => handleReject(task._id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Reject
            </button>
          </>
        ) : (
          <button
            onClick={() => handleMarkResolved(task._id)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Mark as Resolved
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-rose-50">
      {/* Top Nav */}
      <div className="fixed top-0 left-0 w-full bg-gradient-to-r from-rose-100 via-rose-50 to-rose-200 z-20 py-4 px-6 shadow-md flex justify-between items-center">
        <div>
          <p className="font-semibold text-rose-700">{authority.username}</p>
          <p className="text-sm text-gray-600">{authority.email}</p>
        </div>
        <h2 className="text-2xl font-extrabold text-rose-700">Authority ({authority.name})</h2>
        <button
          onClick={handleLogout}
          className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-md transition"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="flex mt-20 h-full">
        {/* Sidebar */}
        <div className="w-64 bg-white rounded-2xl p-5 shadow-lg border border-rose-100 h-[calc(100vh-5rem)] space-y-4 fixed">
          {[
            { key: "incoming", label: "Incoming Tasks", icon: <Inbox size={18} /> },
            { key: "update", label: "Update Accepted", icon: <ClipboardCheck size={18} /> },
            { key: "logs", label: "Logs", icon: <FileClock size={18} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                activeTab === tab.key
                  ? "bg-rose-100 text-rose-700 shadow-inner"
                  : "bg-white text-gray-700 hover:bg-rose-50"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="ml-72 p-6 w-full overflow-y-auto max-h-[calc(100vh-5rem)] space-y-6">
          {activeTab === "incoming" && (
            incomingTasks.length > 0 ? (
              <div className="space-y-6">
                {incomingTasks.map(task => renderTaskCard(task, "incoming"))}
              </div>
            ) : <p className="text-center text-gray-500">No tasks available.</p>
          )}

          {activeTab === "update" && (
            acceptedTasks.length > 0 ? (
              <div className="space-y-6">
                {acceptedTasks.map(task => renderTaskCard(task, "update"))}
              </div>
            ) : <p className="text-center text-gray-500">No accepted tasks.</p>
          )}

          {activeTab === "logs" && (
            logs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-xl shadow-md border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left text-gray-700">Complaint ID</th>
                      <th className="px-4 py-2 text-left text-gray-700">Title</th>
                      <th className="px-4 py-2 text-left text-gray-700">Location</th>
                      <th className="px-4 py-2 text-left text-gray-700">Assigned On</th>
                      <th className="px-4 py-2 text-left text-gray-700">Solved On</th>
                      <th className="px-4 py-2 text-left text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log._id} className="border-t border-gray-200">
                        <td className="px-4 py-2">{log._id}</td>
                        <td className="px-4 py-2">{log.title}</td>
                        <td className="px-4 py-2">{log.location}</td>
                        <td className="px-4 py-2">{log.assignedAt ? new Date(log.assignedAt).toLocaleString() : "-"}</td>
                        <td className="px-4 py-2">{log.solvedAt ? new Date(log.solvedAt).toLocaleString() : "-"}</td>
                        <td className="px-4 py-2">
                          <button
                            className="px-3 py-1 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                            onClick={() => setViewingLog(log)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-center text-gray-500">No resolved tasks.</p>
          )}

          {/* View Details Modal */}
          {viewingLog && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg relative">
                <button
                  className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
                  onClick={() => setViewingLog(null)}
                >
                  <X size={24} />
                </button>
                <div className="px-2 space-y-3">
                  <p className="text-sm text-gray-500">Posted: {new Date(viewingLog.createdAt).toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Assigned: {viewingLog.assignedAt ? new Date(viewingLog.assignedAt).toLocaleString() : "-"}</p>
                  <p className="text-sm text-gray-500">Solved: {viewingLog.solvedAt ? new Date(viewingLog.solvedAt).toLocaleString() : "-"}</p>
                  <h3 className="text-xl font-bold text-gray-900">{viewingLog.title}</h3>
                  <p className="text-gray-700">{viewingLog.description}</p>
                  <p className="text-gray-600 font-medium">Location: {viewingLog.location}</p>
                  {viewingLog.image && (
                    <img
                      src={`http://localhost:5000/uploads/complaints/${viewingLog.image}`}
                      alt={viewingLog.title}
                      className="mt-3 rounded-lg max-h-64 object-contain"
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorityDashboard;
