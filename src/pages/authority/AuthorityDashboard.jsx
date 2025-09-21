import React, { useState, useEffect } from "react";
import { MapPin, LogOut, X, Inbox, ClipboardCheck, FileClock, Menu } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

const AuthorityDashboard = () => {
  const [activeTab, setActiveTab] = useState("incoming");
  const [authority, setAuthority] = useState({ username: "", email: "", name: "" });
  const [incomingTasks, setIncomingTasks] = useState([]);
  const [acceptedTasks, setAcceptedTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [viewingLog, setViewingLog] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    message: "",
    onConfirm: null,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const token = localStorage.getItem("authorityToken");
  const navigate = useNavigate();

  // Redirect if no token
  useEffect(() => {
    if (!token) navigate("/", { replace: true });
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
        setIncomingTasks(allTasks.filter((t) => t.status === "assigned"));
        setAcceptedTasks(allTasks.filter((t) => t.status === "inprogress"));
        setLogs(allTasks.filter((t) => t.status === "resolved"));
      } catch (err) {
        console.error("Error fetching tasks:", err.response?.data || err);
      }
    };
    fetchTasks();
  }, [token]);

  // Accept task
  const handleAcceptConfirmed = async (complaintId) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/complaints/${complaintId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = res.data.complaint;

      toast.success(res.data.message);
      setIncomingTasks((prev) => prev.filter((t) => t._id !== complaintId));
      setAcceptedTasks((prev) => [...prev, updated]);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to accept task");
    }
  };

  // Reject task
  const handleRejectConfirmed = async (complaintId) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/complaints/${complaintId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(res.data.message);
      setIncomingTasks((prev) => prev.filter((t) => t._id !== complaintId));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to reject task");
    }
  };

  // Resolve task
  const handleResolveConfirmed = async (complaintId) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/complaints/${complaintId}/resolve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const resolvedTask = res.data.complaint;

      toast.success(res.data.message);
      setAcceptedTasks((prev) => prev.filter((t) => t._id !== complaintId));
      setLogs((prev) => [...prev, resolvedTask]);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to mark resolved");
    }
  };

  // Confirm modal wrapper
  const confirmAction = (message, callback) => {
    setConfirmModal({ visible: true, message, onConfirm: callback });
  };

  // Render task card
  const renderTaskCard = (task, type) => (
    <div
      key={task._id}
      className="bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden transition hover:shadow-xl"
    >
      <div className="px-6 pt-4">
        <div className="flex justify-between items-center mb-2 text-gray-500 text-sm">
          <span>Posted: {new Date(task.createdAt).toLocaleString()}</span>
          <span>
            Assigned: {task.assignedAt ? new Date(task.assignedAt).toLocaleString() : "-"}
          </span>
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
            src={task.image}
            alt={task.title}
            className="mt-3 rounded-lg max-h-64 object-contain"
          />
        )}
      </div>
      <div className="px-6 py-3 bg-gray-50 border-t flex justify-end gap-4">
        {type === "incoming" ? (
          <>
            <button
              onClick={() =>
                confirmAction("Are you sure you want to ACCEPT this task?", () =>
                  handleAcceptConfirmed(task._id)
                )
              }
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Accept
            </button>
            <button
              onClick={() =>
                confirmAction("Are you sure you want to REJECT this task?", () =>
                  handleRejectConfirmed(task._id)
                )
              }
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Reject
            </button>
          </>
        ) : (
          <button
            onClick={() =>
              confirmAction("Mark this task as RESOLVED?", () =>
                handleResolveConfirmed(task._id)
              )
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Mark as Resolved
          </button>
        )}
      </div>
    </div>
  );

  // NavButton component for mobile view
  const NavButton = ({ icon: Icon, label, tabKey }) => (
    <button
      onClick={() => {
        setActiveTab(tabKey);
        setMobileMenuOpen(false);
      }}
      className={`flex items-center justify-center w-full p-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
        activeTab === tabKey
          ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md"
          : "text-rose-600 hover:bg-rose-100 hover:text-rose-700"
      }`}
    >
      <Icon size={18} />
    </button>
  );

  return (
    <div className="h-screen flex flex-col bg-rose-50">
      <Toaster />
      {/* Mobile Navbar */}
      <nav className="md:hidden fixed top-0 left-0 right-0 bg-gradient-to-r from-rose-100 via-rose-50 to-rose-200 z-30 py-4 px-4 shadow-md">
        <div className="flex items-center justify-between">
          {/* Left: User Info and Navigation Icons */}
          <div className="flex items-center space-x-2">
            <div>
              <p className="font-semibold text-rose-700 text-sm">{authority.username}</p>
              <p className="text-xs text-gray-600">{authority.email}</p>
            </div>
            <div className="flex space-x-2">
              <NavButton icon={Inbox} label="Incoming Tasks" tabKey="incoming" />
              <NavButton icon={ClipboardCheck} label="Update Accepted" tabKey="update" />
              <NavButton icon={FileClock} label="Logs" tabKey="logs" />
            </div>
          </div>

          {/* Right: Hamburger Menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-rose-600 hover:text-rose-800"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown for Logout */}
        {mobileMenuOpen && (
          <div className="bg-white shadow-lg p-4 mt-2 rounded-xl">
            <div className="flex flex-col gap-2">
              <button
                onClick={() =>
                  confirmAction("Are you sure you want to logout?", () => {
                    localStorage.removeItem("authorityToken");
                    navigate("/", { replace: true });
                    setMobileMenuOpen(false);
                  })
                }
                className="flex items-center w-full px-3 py-2 rounded-xl text-rose-700 hover:bg-rose-100 hover:text-rose-800 font-semibold text-sm transition-all duration-300"
              >
                <LogOut size={18} className="mr-2" /> Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Desktop Top Nav */}
      <div className="hidden md:flex fixed top-0 left-0 w-full bg-gradient-to-r from-rose-100 via-rose-50 to-rose-200 z-20 py-4 px-6 shadow-md justify-between items-center">
        <div>
          <p className="font-semibold text-rose-700">{authority.username}</p>
          <p className="text-sm text-gray-600">{authority.email}</p>
        </div>
        <h2 className="text-2xl font-extrabold text-rose-700">Authority ({authority.name})</h2>
        <button
          onClick={() =>
            confirmAction("Are you sure you want to logout?", () => {
              localStorage.removeItem("authorityToken");
              navigate("/", { replace: true });
            })
          }
          className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-md transition"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="flex mt-20 md:mt-20 h-full">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 bg-white rounded-2xl p-5 shadow-lg border border-rose-100 h-[calc(100vh-5rem)] space-y-4 fixed">
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
        <div className="w-full p-6 overflow-y-auto max-h-[calc(100vh-5rem)] space-y-6 md:ml-64 mt-16 md:mt-0">
          {activeTab === "incoming" &&
            (incomingTasks.length > 0 ? (
              <div className="space-y-6">
                {incomingTasks.map((task) => renderTaskCard(task, "incoming"))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No tasks available.</p>
            ))}

          {activeTab === "update" &&
            (acceptedTasks.length > 0 ? (
              <div className="space-y-6">
                {acceptedTasks.map((task) => renderTaskCard(task, "update"))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No accepted tasks.</p>
            ))}

          {activeTab === "logs" &&
            (logs.length > 0 ? (
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
                    {logs.map((log) => (
                      <tr key={log._id} className="border-t border-gray-200">
                        <td className="px-4 py-2">{log._id}</td>
                        <td className="px-4 py-2">{log.title}</td>
                        <td className="px-4 py-2">{log.location}</td>
                        <td className="px-4 py-2">
                          {log.assignedAt ? new Date(log.assignedAt).toLocaleString() : "-"}
                        </td>
                        <td className="px-4 py-2">
                          {log.solvedAt ? new Date(log.solvedAt).toLocaleString() : "-"}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            className="px-3 py-1 bg-rose-600 text-white rounded-md hover:bg-rose-700"
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
            ) : (
              <p className="text-center text-gray-500">No resolved tasks.</p>
            ))}

          {/* View Details Modal */}
          {viewingLog && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center bg-rose-200/20 backdrop-blur-lg z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                className="bg-rose-100/30 backdrop-blur-md rounded-xl p-6 w-full max-w-lg shadow-lg border border-rose-200 relative"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  className="absolute top-4 right-4 text-rose-600 hover:text-rose-800"
                  onClick={() => setViewingLog(null)}
                >
                  <X size={24} />
                </button>
                <div className="px-2 space-y-3">
                  <p className="text-sm text-rose-600">
                    Posted: {new Date(viewingLog.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-rose-600">
                    Assigned:{" "}
                    {viewingLog.assignedAt ? new Date(viewingLog.assignedAt).toLocaleString() : "-"}
                  </p>
                  <p className="text-sm text-rose-600">
                    Solved:{" "}
                    {viewingLog.solvedAt ? new Date(viewingLog.solvedAt).toLocaleString() : "-"}
                  </p>
                  <h3 className="text-xl font-bold text-rose-700">{viewingLog.title}</h3>
                  <p className="text-rose-600">{viewingLog.description}</p>
                  <p className="text-rose-600 font-medium">Location: {viewingLog.location}</p>
                  {viewingLog.image && (
                    <img
                      src={viewingLog.image}
                      alt={viewingLog.title}
                      className="mt-3 rounded-lg max-h-64 object-contain"
                    />
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Confirmation Modal */}
          {confirmModal.visible && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-rose-200/20 to-pink-200/20 backdrop-blur-lg z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                className="bg-gradient-to-br from-rose-100/40 to-pink-100/40 backdrop-blur-lg rounded-xl shadow-lg p-8 w-full max-w-sm sm:max-w-md border border-rose-200/70 relative border-rose-500"
                style={{
                  boxShadow:
                    "0 8px 24px rgba(190, 18, 61, 0.74), inset 0 2px 4px rgba(255, 255, 255, 0.53)",
                }}
                initial={{ opacity: 0, scale: 0.85, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <h3 className="text-xl font-bold text-rose-800 mb-4">
                  {confirmModal.message}
                </h3>
                <div className="flex justify-end gap-4">
                  <button
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg shadow-sm hover:bg-gray-400"
                    onClick={() => setConfirmModal({ ...confirmModal, visible: false })}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-rose-500 text-white rounded-lg shadow-sm hover:bg-rose-600"
                    onClick={() => {
                      confirmModal.onConfirm();
                      setConfirmModal({ ...confirmModal, visible: false });
                    }}
                  >
                    Confirm
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorityDashboard;