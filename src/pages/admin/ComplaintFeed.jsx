import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapPin, Shield, User, ArrowLeft, ArrowUp, ArrowDown } from "lucide-react";
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
          user: c.anonymous ? "Anonymous" : c.user?.fullName || "Unknown",
          title: c.title,
          description: c.description,
          location: c.location || "N/A",
          complaintType: c.complaintType,
          severity: c.severity,
          status: c.status,
          assignedTo: c.assignedTo
            ? `${c.assignedTo.name} (${c.assignedTo.type})`
            : "Not Assigned",
          upvotes: c.upvotes,
          downvotes: c.downvotes,
          image: c.image
            ? `http://localhost:5000/uploads/complaints/${c.image}`
            : null,
          time: new Date(c.createdAt).toLocaleString(),
        }));
        console

        setComplaints(mapped);
      } catch (err) {
        console.error("Error fetching complaints:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  // Count complaints by status
  const counts = complaints.reduce(
    (acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    },
    { pending: 0, assigned: 0, inprogress: 0, resolved: 0 }
  );

  const filtered = complaints.filter((c) => c.status === activePhase);

  return (
    <div className="p-6 overflow-y-auto max-h-[calc(100vh-4rem)] bg-gray-50 min-h-screen">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-rose-600 font-semibold mb-4"
      >
        <ArrowLeft size={20} className="mr-2" /> Back
      </button>

      <h2 className="text-2xl font-bold text-rose-600 mb-6">Admin Complaint Feed</h2>

      {/* Toggle buttons with counts */}
      <div className="flex space-x-4 mb-6">
        {["pending", "assigned", "inprogress", "resolved"].map((phase) => (
          <button
            key={phase}
            onClick={() => setActivePhase(phase)}
            className={`px-4 py-2 rounded-lg font-semibold transition flex justify-between items-center w-[150px] ${
              activePhase === phase
                ? "bg-rose-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span>{phase.charAt(0).toUpperCase() + phase.slice(1)}</span>
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm font-bold">
              {counts[phase]}
            </span>
          </button>
        ))}
      </div>

      {/* Complaint list */}
      {loading ? (
        <p className="text-gray-500">Loading complaints...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">No complaints in {activePhase} phase.</p>
      ) : (
        <div className="space-y-6">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="px-6 pt-4">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-blue-800">{c.user}</span>
                  <div className="flex flex-col items-end text-sm text-gray-500">
                    <span>{c.time}</span>
                    {c.location && (
                      <div className="flex items-center mt-1">
                        <MapPin size={16} className="mr-1 text-rose-500 flex-shrink-0" />
                        <span className="text-gray-700">{c.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-1">{c.title}</h3>
                <p className="text-sm text-rose-600 font-semibold mb-2">{c.complaintType}</p>
                <p className="text-sm text-gray-700 mb-2">
                  Severity: <span className="font-semibold">{c.severity}</span>
                </p>
                <p className="text-sm text-green-600 font-semibold mb-2 flex items-center">
                  <Shield size={16} className="mr-1" /> Assigned To: {c.assignedTo}
                </p>
                <hr className="border-gray-300 border-[1.2px] mb-3 mt-3" />
              </div>

              <div className="px-6 pb-4">
                <p className="text-gray-700 mb-4">Description:<span className="font-semibold"> {c.description}</span>  </p>
                {c.image && (
                  <div className="flex justify-center bg-gray-50 rounded-xl overflow-hidden">
                    <img src={c.image} alt="Complaint" className="max-h-[500px] w-auto object-contain" />
                  </div>
                )}
              </div>

              {/* Upvote / Downvote numbers only */}
              <div className="flex items-center space-x-6 px-6 py-3 border-t border-gray-200">
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
