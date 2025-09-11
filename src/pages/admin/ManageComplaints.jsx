import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const ManageComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [authorities, setAuthorities] = useState([]);

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

  const updateComplaint = async (complaint) => {
    try {
      await axios.put(
        `http://localhost:5000/api/complaints/${complaint._id}`,
        complaint,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComplaints((prev) =>
        prev.map((c) => (c._id === complaint._id ? complaint : c))
      );
      setSelectedComplaint(null);
    } catch (err) {
      console.error(err.response?.data || err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this complaint?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/complaints/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error(err.response?.data || err);
    }
  };

  const handleAssignAuthority = async (complaintId, authorityId) => {
    try {
      const updatedComplaint = { ...complaints.find((c) => c._id === complaintId), assigned_to: authorityId };
      await updateComplaint(updatedComplaint);
      alert(`Assigned authority to complaint ID: ${complaintId}`);
    } catch (err) {
      console.error(err.response?.data || err);
    }
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) =>
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [complaints, searchTerm]);

  const sortedComplaints = useMemo(() => {
    return [...filteredComplaints].sort((a, b) => {
      if (sortField === "severity") {
        const order = { low: 1, medium: 2, high: 3 };
        return (order[b.severity] || 0) - (order[a.severity] || 0);
      }
      if (sortField === "upvotes" || sortField === "popular") {
        return (b.upvotes || 0) - (a.upvotes || 0);
      }
      if (sortField === "anonymity") {
        return (a.user?.isAnonymous === true ? -1 : 1);
      }
      return 0;
    });
  }, [filteredComplaints, sortField]);

  const getSeverityBadge = (severity) => {
    const base = "px-2 py-1 rounded-full text-xs font-semibold";
    const map = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800",
    };
    return <span className={`${base} ${map[severity] || "bg-gray-100 text-gray-800"}`}>{severity}</span>;
  };

  if (loading) return <p className="text-center mt-10 text-gray-600">Loading complaints...</p>;

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-100">
      <h1 className="text-4xl font-bold mb-8 text-center text-rose-800">Manage Complaints</h1>

      <div className="flex gap-6">
        {/* Left Sidebar - Search + Sort */}
        <div className="w-1/4 bg-white rounded-2xl p-5 shadow-xl border border-rose-100 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search complaints..."
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300"
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
            >
              <option value="">Sort by</option>
              <option value="popular">Popular</option>
              <option value="severity">Severity</option>
              <option value="upvotes">Upvotes</option>
              <option value="anonymity">Anonymity</option>
            </select>
          </div>
        </div>

        {/* Center - Complaint Cards */}
        <div className="flex-1 space-y-6">
          {sortedComplaints.length > 0 ? (
            sortedComplaints.map((c) => (
              <motion.div
                key={c._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl shadow-md hover:shadow-2xl border border-gray-100 cursor-pointer overflow-hidden"
                onClick={() => setSelectedComplaint(c)}
              >
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-700 text-sm font-medium">
                      {c.user?.isAnonymous
                        ? `Anonymous (${c.user?.username || "user"})`
                        : c.user?.fullName || "User"}
                    </p>
                    {getSeverityBadge(c.severity)}
                  </div>

                  <p className="text-gray-900 font-semibold text-lg">{c.title}</p>

                  {c.status && c.status !== "pending" && (
                    <p className="text-sm text-gray-600">
                      <strong>Status:</strong> {c.status}
                    </p>
                  )}

                  <p className="text-sm text-gray-600">
                    <strong>Assigned To:</strong> {c.assigned_to?.name || "Unassigned"}
                  </p>

                  <p className="text-sm text-gray-600">
                    <strong>Upvotes:</strong> {c.upvotes || 0}
                  </p>

                  {c.image && (
                    <img
                      src={`http://localhost:5000/uploads/complaints/${c.image}`}
                      alt="Complaint"
                      className="w-full h-52 object-cover rounded-xl border border-gray-100"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 border-t border-gray-100">
                  <button
                    className="px-3 py-1 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 shadow"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(c._id);
                    }}
                  >
                    Delete
                  </button>
                  <select
                    onChange={(e) => handleAssignAuthority(c._id, e.target.value)}
                    className="border rounded px-3 py-2 shadow focus:ring-2 focus:ring-rose-500"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Assign Authority
                    </option>
                    {authorities.map((auth) => (
                      <option key={auth._id} value={auth._id}>
                        {auth.name}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-gray-500">No complaints found.</p>
          )}
        </div>
      </div>

      {/* Complaint Modal */}
      <AnimatePresence>
        {selectedComplaint && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative"
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
              <h2 className="text-2xl font-bold mb-4">{selectedComplaint.title}</h2>
              {/* Modal details can be expanded here */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageComplaints;
