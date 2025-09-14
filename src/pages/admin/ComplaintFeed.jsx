// src/pages/admin/AdminComplaintFeed.jsx
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
        const res = await axios.get("http://localhost:5000/api/complaints/admin", {
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
          image: c.image
            ? `http://localhost:5000/uploads/complaints/${c.image}`
            : null,
          time: new Date(c.createdAt).toLocaleString(),
        }));

        setComplaints(mapped);
      } catch (err) {
        console.error("Error fetching complaints:", err);
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
      color: "rose",
    },
    {
      key: "assigned",
      label: "Assigned",
      icon: <UserCheck size={18} />,
      color: "blue",
    },
    {
      key: "inprogress",
      label: "In Progress",
      icon: <Loader2 size={18} />,
      color: "amber",
    },
    {
      key: "resolved",
      label: "Resolved",
      icon: <CheckCircle2 size={18} />,
      color: "green",
    },
  ];

  return (
    <div className="p-6 overflow-y-auto max-h-[calc(100vh-4rem)] bg-gradient-to-br from-rose-50 to-slate-100 min-h-screen">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-rose-600 font-semibold mb-6 hover:underline"
      >
        <ArrowLeft size={20} className="mr-2" /> Back
      </button>

      <h2 className="text-3xl font-extrabold text-slate-800 mb-6">
        Admin Complaint Feed
      </h2>

      {/* Toggle buttons - fully responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {statusButtons.map((btn) => (
          <button
            key={btn.key}
            onClick={() => setActivePhase(btn.key)}
            className={`flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-all shadow-sm border 
              ${
                activePhase === btn.key
                  ? `bg-${btn.color}-600 text-white shadow-md`
                  : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
              }`}
          >
            <div className="flex items-center gap-2">
              {btn.icon}
              <span>{btn.label}</span>
            </div>
            <span
              className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold 
                ${
                  activePhase === btn.key
                    ? "bg-white/30 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
            >
              {counts[btn.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Complaint list */}
      {loading ? (
        <p className="text-gray-500">Loading complaints...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">
          No complaints in{" "}
          <span className="font-semibold">{activePhase}</span> phase.
        </p>
      ) : (
        <div className="space-y-6">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white shadow-md rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="px-6 pt-4">
                {/* User + anonymous badge + meta */}
                <div className="flex justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{c.user}</span>
                    {c.anonymous && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-slate-700 text-white font-medium">
                        Anonymous
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-end text-sm text-gray-500">
                    <span>{c.time}</span>
                    {c.location && (
                      <div className="flex items-center mt-1">
                        <MapPin size={16} className="mr-1 text-rose-500" />
                        <span className="text-gray-700">{c.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  {c.title}
                </h3>
                <p className="text-sm text-rose-600 font-semibold mb-2">
                  {c.complaintType}
                </p>
                <p className="text-sm text-slate-700 mb-2">
                  Severity: <span className="font-semibold">{c.severity}</span>
                </p>
                <p className="text-sm text-green-600 font-semibold mb-2 flex items-center">
                  <Shield size={16} className="mr-1" /> Assigned To: {c.assignedTo}
                </p>
                <hr className="border-slate-200 my-3" />
              </div>

              <div className="px-6 pb-4">
                <p className="text-slate-700 mb-4">
                  Description:{" "}
                  <span className="font-medium">{c.description}</span>
                </p>
                {c.image && (
                  <div className="flex justify-center bg-slate-50 rounded-xl overflow-hidden">
                    <img
                      src={c.image}
                      alt="Complaint"
                      className="max-h-[500px] w-auto object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Upvote / Downvote */}
              <div className="flex items-center space-x-6 px-6 py-3 border-t border-slate-200">
                <div className="flex items-center space-x-2 text-blue-600 font-semibold">
                  <ArrowUp size={20} />
                  <span>{c.upvotes}</span>
                </div>

                <div className="flex items-center space-x-2 text-red-600 font-semibold">
                  <ArrowDown size={20} />
                  <span>{c.downvotes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminComplaintFeed;
