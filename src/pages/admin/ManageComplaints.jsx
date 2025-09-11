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
  const [showAssigned, setShowAssigned] = useState(false);

  const token = localStorage.getItem("adminToken");

  // Fetch complaints and authorities
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

  // Assign authority to complaint
  const handleAssignAuthority = async (complaintId, authorityId) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/complaints/assign",
        { complaintId, authorityId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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

  // Filter based on toggle
  const filteredComplaints = useMemo(() => {
    return complaints.filter(
      (c) =>
        (showAssigned ? c.assigned_to : !c.assigned_to) &&
        c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [complaints, searchTerm, showAssigned]);

  // Sort filtered complaints
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
        return a.user?.isAnonymous === true ? -1 : 1;
      }
      return 0;
    });
  }, [filteredComplaints, sortField]);

  // Badge for severity
  const getSeverityBadge = (severity) => {
    const base = "px-2 py-1 rounded-full text-xs font-semibold";
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

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-600">Loading complaints...</p>
    );

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-100">
      <h1 className="text-4xl font-bold mb-8 text-center text-rose-800">
        Manage Complaints
      </h1>

      {/* Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-gray-700 font-medium">Show Assigned:</span>
        <input
          type="checkbox"
          checked={showAssigned}
          onChange={() => setShowAssigned(!showAssigned)}
          className="w-5 h-5 rounded"
        />
      </div>

      <div className="flex gap-6">
        {/* Sidebar: Search & Sort */}
        <div className="w-1/4 bg-white rounded-2xl p-5 shadow-xl border border-rose-100 space-y-4">
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
              <option value="upvotes">Upvotes</option>
              <option value="anonymity">Anonymity</option>
            </select>
          </div>
        </div>

        {/* Complaint Cards */}
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

                  <p className="text-gray-900 font-semibold text-lg">
                    {c.title}
                  </p>

                  {c.status && (
                    <p className="text-sm text-gray-600">
                      <strong>Status:</strong> {c.status}
                    </p>
                  )}

                  <p className="text-sm text-gray-600">
                    <strong>Assigned To:</strong>{" "}
                    {c.assigned_to?.name
                      ? `${c.assigned_to.name} (${c.assigned_to.type})`
                      : "Unassigned"}
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
                {!c.assigned_to && (
                  <div className="flex justify-end items-center p-4 bg-gray-50 border-t border-gray-100">
                    <button
                      className="px-4 py-2 text-sm rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow"
                      onClick={() => setSelectedComplaint(c)}
                    >
                      Assign Authority
                    </button>
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <p className="text-center text-gray-500">No complaints found.</p>
          )}
        </div>
      </div>

      {/* Assign Authority Modal */}
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
                        <p className="text-gray-800 font-medium">{auth.username}</p>
                      </div>
                      <button
                        className="px-3 py-1 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600"
                        onClick={() => handleAssignAuthority(selectedComplaint._id, auth._id)}
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
    </div>
  );
};

export default ManageComplaints;
