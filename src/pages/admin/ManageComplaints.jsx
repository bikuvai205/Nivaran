import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, ArrowDown, MapPin } from "lucide-react";

const ManageComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [authorities, setAuthorities] = useState([]);
  const [showAssigned, setShowAssigned] = useState(false);

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const [complaintsRes, authoritiesRes] = await Promise.all([
          axios.get("http://localhost:5000/api/complaints/admin", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/authorities", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setComplaints(complaintsRes.data);
        setAuthorities(authoritiesRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Assign authority
  const handleAssignAuthority = async (complaintId, authorityId) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/complaints/assign",
        { complaintId, authorityId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedComplaint = res.data.updatedComplaint;
      if (!updatedComplaint) return;

      setComplaints((prev) =>
        prev.map((c) => (c._id === complaintId ? updatedComplaint : c))
      );

      setSelectedComplaint(null);
      alert(res.data.message || "Authority assigned successfully");
    } catch (err) {
      console.error("Error assigning authority:", err);
      alert("Failed to assign authority");
    }
  };

  // Filter + search
  const filteredComplaints = useMemo(() => {
    return complaints.filter(
      (c) =>
        (showAssigned ? c.assigned_to : !c.assigned_to) &&
        c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [complaints, searchTerm, showAssigned]);

  // Sort
  const sortedComplaints = useMemo(() => {
    return [...filteredComplaints].sort((a, b) => {
      if (sortField === "severity") {
        const order = { low: 1, medium: 2, high: 3 };
        return (order[b.severity?.toLowerCase()] || 0) - (order[a.severity?.toLowerCase()] || 0);
      }
      if (sortField === "popular") {
        return (b.upvotes || 0) - (a.upvotes || 0);
      }
      if (sortField === "anonymity") {
        // true → 1, false → 0
        return (b.anonymous === true) - (a.anonymous === true);
      }
      return 0;
    });
  }, [filteredComplaints, sortField]);

  const getSeverityBadge = (severity) => {
    const base = "px-2 py-1 rounded-full text-xs font-semibold capitalize";
    const map = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800",
    };
    return (
      <span className={`${base} ${map[severity] || "bg-gray-100 text-gray-800"}`}>
        {severity}
      </span>
    );
  };

  if (loading) {
    return (
      <p className="text-center mt-10 text-gray-600">Loading complaints...</p>
    );
  }

  return (
    <div className="p-6 bg-rose-200 bg-opacity-70 h-screen overflow-hidden">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 w-full bg-rose-200 bg-opacity-70 z-10 py-4">
        <h2 className="text-3xl font-bold text-rose-700 text-center">
          Assign Complaints
        </h2>
      </div>

      <div className="flex">
        {/* Fixed Sidebar */}
        <div className="fixed top-16 w-1/4 bg-rose-50 bg-opacity-80 rounded-2xl p-5 shadow-lg border border-rose-100 space-y-4 h-[calc(100vh-4rem)]">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search complaints..."
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300"
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
            >
              <option value="">Sort by</option>
              <option value="popular">Popular</option>
              <option value="severity">Severity</option>
              <option value="anonymity">Anonymity</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showAssigned}
              onChange={() => setShowAssigned(!showAssigned)}
              className="w-5 h-5 rounded"
            />
            <span className="text-gray-700 font-medium">Show Assigned</span>
          </div>
        </div>

        {/* Scrollable Feeds Section */}
        <div className="ml-[25%] mt-16 w-3/4 overflow-y-auto max-h-[calc(100vh-4rem)] space-y-6 px-6">
          {sortedComplaints.length > 0 ? (
            <>
              {sortedComplaints.map((c) => (
                <motion.div
                  key={c._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="complaint-card shadow-lg rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-shadow duration-300"
                >
                  <div className="px-6 pt-4">
                    {/* User + meta */}
                    <div className="flex justify-between mb-2 items-start">
                      {/* Left Side: User */}
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-blue-800">
                          {c.user?.fullName || c.user?.username || "Unknown User"}
                        </span>
                        {c.anonymous && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-black text-white font-medium">
                            Anonymous
                          </span>
                        )}
                      </div>

                      {/* Right Side: Time + Location */}
                      <div className="flex flex-col items-end text-sm text-gray-500">
                        <span>{new Date(c.createdAt).toLocaleString()}</span>
                        {c.location && (
                          <div className="flex items-center mt-1">
                            <MapPin size={16} className="mr-1 text-rose-500 flex-shrink-0" />
                            <span className="text-gray-700">{c.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata badges (centered below) */}
                    <div className="flex justify-center gap-3 mt-2 mb-3">
                      {/* Severity */}
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium w-24 text-center capitalize ${
                          c.severity === "high"
                            ? "bg-red-100 text-red-700"
                            : c.severity === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {c.severity || "N/A"}
                      </span>

                      {/* Status */}
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium w-24 text-center capitalize ${
                          c.status === "Resolved"
                            ? "bg-green-100 text-green-700"
                            : c.status === "In Progress"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {c.status || "Pending"}
                      </span>

                      {/* Assigned */}
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium w-32 text-center capitalize ${
                          c.assigned_to
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {c.assigned_to?.name
                          ? `${c.assigned_to.name} (${c.assigned_to.type})`
                          : "Unassigned"}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {c.title}
                    </h3>
                    <p className="text-sm text-rose-600 font-semibold mb-2">
                      {c.complaintType}
                    </p>
                    <hr className="border-gray-300 border-[1.2px] mb-3" />
                  </div>

                  <div className="px-6 pb-4">
                    <p className="text-gray-700 mb-3">{c.description}</p>
                    {c.image && (
                      <div className="flex justify-center bg-gray-50 rounded-xl overflow-hidden">
                        <img
                          src={`http://localhost:5000/uploads/complaints/${c.image}`}
                          alt="Complaint"
                          className="max-h-[400px] w-auto object-contain"
                        />
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
                    {/* Upvote / downvote */}
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <ArrowUp size={24} strokeWidth={3} className="text-blue-600" />
                        <span className="font-semibold text-gray-700">{c.upvotes}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ArrowDown size={24} strokeWidth={3} className="text-red-600" />
                        <span className="font-semibold text-gray-700">{c.downvotes}</span>
                      </div>
                    </div>

                    {!c.assigned_to && (
                      <button
                        className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 shadow"
                        onClick={() => setSelectedComplaint(c)}
                      >
                        Assign to authority
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
              <p className="text-sm text-gray-500 text-center mt-4">No more complaints</p>
            </>
          ) : (
            <p className="text-center text-gray-500">No complaints found.</p>
          )}
        </div>
      </div>

      {/* Assign Modal */}
      <AnimatePresence>
        {selectedComplaint && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative"
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              exit={{ y: 50 }}
            >
              <button
                className="absolute top-4 right-4 text-gray-600 hover:text-red-500"
                onClick={() => setSelectedComplaint(null)}
              >
                ✕
              </button>
              <h2 className="text-xl font-bold mb-4 text-rose-700">
                Assign Authority
              </h2>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {authorities.length > 0 ? (
                  authorities.map((auth) => (
                    <div
                      key={auth._id}
                      className="flex justify-between items-center border rounded-lg px-4 py-2 hover:bg-rose-50"
                    >
                      <div>
                        <p className="text-gray-800 font-medium">{auth.type}</p>
                        <p className="text-gray-600">{auth.username}</p>
                      </div>
                      <button
                        className="px-3 py-1 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600"
                        onClick={() =>
                          handleAssignAuthority(selectedComplaint._id, auth._id)
                        }
                      >
                        Select
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No authorities found.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>
        {`
          .complaint-card {
            background: linear-gradient(to bottom right, rgba(255, 241, 242, 0.8), rgba(255, 228, 230, 0.8));
          }
        `}
      </style>
    </div>
  );
};

export default ManageComplaints;