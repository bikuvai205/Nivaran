import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  MapPin,
  Shield,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Clock,
  UserCheck,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

const AdminComplaintFeed = () => {
  const [complaints, setComplaints] = useState([]);
  const [activePhase, setActivePhase] = useState("pending");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("adminToken");
        const res = await axios.get("https://nivaran-backend-zw9j.onrender.com/api/complaints/admin", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const mapped = res.data.map((c) => ({
          id: c._id,
          user: c.user?.fullName || "Unknown",
          anonymous: c.anonymous,
          title: c.title,
          description: c.description,
          location: c.location || "N/A",
          complaintType: c.complaintType,
          severity: c.severity,
          status: c.status,
          assignedTo: c.assignedTo
            ? `${c.assignedTo.username} (${c.assignedTo.type})`
            : "Not Assigned",
          upvotes: c.upvotes,
          downvotes: c.downvotes,
          image: c.image|| null,
           
          time: new Date(c.createdAt).toLocaleString(),
        }));

        setComplaints(mapped);
      } catch (err) {
        console.error("Error fetching complaints:", err);
        toast.error(err.response?.data?.message || "Failed to fetch complaints", {
          duration: 4000,
          position: 'top-right',
          style: {
            background: 'rgba(255, 228, 230, 0.3)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(254, 205, 211, 0.5)',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            color: '#be123c',
            padding: '12px 24px',
            margin: '8px',
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const counts = complaints.reduce(
    (acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    },
    { pending: 0, assigned: 0, inprogress: 0, resolved: 0 }
  );

  const filtered = complaints.filter((c) => c.status === activePhase);

  const statusButtons = [
    {
      key: "pending",
      label: "Pending",
      icon: <Clock size={18} />,
    },
    {
      key: "assigned",
      label: "Assigned",
      icon: <UserCheck size={18} />,
    },
    {
      key: "inprogress",
      label: "In Progress",
      icon: <Loader2 size={18} />,
    },
    {
      key: "resolved",
      label: "Resolved",
      icon: <CheckCircle2 size={18} />,
    },
  ];

  return (
    <div className="p-6 overflow-y-auto max-h-[calc(100vh-4rem)] bg-rose-50/30 backdrop-blur-md min-h-screen">
      <Toaster />
      {/* Back button */}
     <button
          onClick={() => navigate("/homepage")}
          className="p-2 mr-4 rounded-full hover:bg-rose-300 transition"
        >
          <ArrowLeft size={24} className="text-rose-700" />
        </button>

      <h2 className="text-3xl font-extrabold text-rose-800 mb-6">
        Admin Complaint Feed
      </h2>

      {/* Toggle buttons - fully responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {statusButtons.map((btn, index) => (
          <motion.button
            key={btn.key}
            onClick={() => setActivePhase(btn.key)}
            className={`flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-all shadow-sm border border-rose-200/70 backdrop-blur-md ${
              activePhase === btn.key
                ? "bg-rose-500/80 text-white"
                : "bg-rose-100/30 text-rose-700 hover:bg-rose-100/50 hover:shadow-[0_4px_12px_rgba(190,18,60,0.2)]"
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <div className="flex items-center gap-2">
              {btn.icon}
              <span>{btn.label}</span>
            </div>
            <span
              className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                activePhase === btn.key
                  ? "bg-white/30 text-white"
                  : "bg-rose-200/50 text-rose-700"
              }`}
            >
              {counts[btn.key]}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Complaint list */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 size={32} className="text-rose-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-rose-600 text-center">
          No complaints in <span className="font-semibold">{activePhase}</span> phase.
        </p>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {filtered.map((c, index) => (
              <motion.div
                key={c.id}
                className="bg-rose-100/30 backdrop-blur-md rounded-xl border border-rose-200/70 overflow-hidden"
                style={{ boxShadow: '0 8px 32px rgba(190, 18, 60, 0.2), inset 0 2px 6px rgba(255, 255, 255, 0.3)' }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Header Section */}
                <div className="px-6 py-4 bg-rose-100/40 backdrop-blur-lg border-b border-rose-200/50">
                  <div className="flex justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-rose-800">{c.user}</span>
                      {c.anonymous && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-rose-500/90 text-white font-medium backdrop-blur-sm">
                          Anonymous
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end text-sm text-rose-600">
                      <span>{c.time}</span>
                      {c.location && (
                        <div className="flex items-center mt-1">
                          <MapPin size={16} className="mr-1 text-rose-500" />
                          <span>{c.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Body Section */}
                <div className="px-6 py-4">
                  <h3 className="text-2xl font-extrabold text-rose-800 mb-2">
                    {c.title}
                  </h3>
                  <p className="text-sm font-semibold text-rose-700 uppercase mb-2">
                    {c.complaintType}
                  </p>
                  <p className="text-sm text-rose-700 font-medium mb-2">
                    Severity: <span className="font-semibold">{c.severity}</span>
                  </p>
                  <p className="text-sm text-rose-700 font-medium mb-2 flex items-center">
                    <Shield size={16} className="mr-1 text-rose-500" /> Assigned To: <span className="font-semibold ml-1">{c.assignedTo}</span>
                  </p>
                  <hr className="border-rose-200/70 my-3" />
                  <p className="text-base text-rose-600 mb-4">
                    Description: <span className="font-medium">{c.description}</span>
                  </p>
                  {c.image && (
                    <div className="flex justify-center bg-rose-50/70 backdrop-blur-sm rounded-xl overflow-hidden">
                      <img
                        src={c.image}
                        alt="Complaint"
                        className="max-h-[500px] w-auto object-contain"
                      />
                    </div>
                  )}
                </div>

                {/* Footer Section */}
                <div className="flex items-center space-x-6 px-6 py-3 bg-rose-100/50 backdrop-blur-md border-t border-rose-200/50">
                  <motion.div
                    className="flex items-center space-x-2 text-rose-700 font-semibold hover:text-rose-800"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ArrowUp size={20} />
                    <span>{c.upvotes}</span>
                  </motion.div>
                  <motion.div
                    className="flex items-center space-x-2 text-rose-700 font-semibold hover:text-rose-800"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ArrowDown size={20} />
                    <span>{c.downvotes}</span>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default AdminComplaintFeed;
