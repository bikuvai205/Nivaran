import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const ManageComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [authorities, setAuthorities] = useState([]);
  const [sortField, setSortField] = useState("");

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

  const sortedComplaints = useMemo(() => {
    return [...complaints].sort((a, b) => {
      if (sortField === "severity") {
        const order = { low: 1, medium: 2, high: 3 };
        return (order[b.severity] || 0) - (order[a.severity] || 0);
      }
      if (sortField === "upvotes") return (b.upvotes || 0) - (a.upvotes || 0);
      if (sortField === "status") {
        const statusOrder = { pending: 1, inprogress: 2, approved: 3, rejected: 4 };
        return (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
      }
      return 0;
    });
  }, [complaints, sortField]);

  const getStatusBadge = (status) => {
    const base = "px-3 py-1 rounded-full text-sm font-semibold uppercase";
    const map = {
      pending: "bg-yellow-200 text-yellow-900",
      inprogress: "bg-blue-200 text-blue-900",
      approved: "bg-green-200 text-green-900",
      rejected: "bg-red-200 text-red-900",
    };
    return <span className={`${base} ${map[status] || "bg-gray-200 text-gray-800"}`}>{status}</span>;
  };

  if (loading) return <p className="text-center mt-10 text-gray-600">Loading complaints...</p>;

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-100">
      <h1 className="text-4xl font-bold mb-8 text-center text-rose-800">Manage Complaints</h1>

      <div className="flex flex-wrap justify-around gap-4 mb-6">
        {["Total", "Pending", "In Progress", "Approved"].map((label, idx) => {
          const count =
            label === "Total"
              ? complaints.length
              : complaints.filter((c) => c.status.toLowerCase().replace(" ", "") === label.toLowerCase().replace(" ", "")).length;
          const colors = ["bg-blue-100", "bg-yellow-100", "bg-blue-200", "bg-green-100"];
          return (
            <div key={idx} className={`flex-1 min-w-[150px] ${colors[idx]} p-4 rounded-lg text-center shadow`}>
              <p className="text-gray-600">{label}</p>
              <p className="text-2xl font-bold">{count}</p>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end mb-4">
        <select
          className="border rounded px-3 py-2 shadow focus:ring-2 focus:ring-rose-500"
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
        >
          <option value="">Sort by</option>
          <option value="severity">Severity</option>
          <option value="upvotes">Upvotes</option>
          <option value="status">Status</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedComplaints.map((c) => (
          <motion.div
            key={c._id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            whileHover={{ scale: 1.03 }}
            className={`bg-white rounded-2xl shadow-lg transition border ${
              c.severity === "high" ? "border-red-400" : c.severity === "medium" ? "border-yellow-400" : "border-green-400"
            } cursor-pointer overflow-hidden`}
            onClick={() => setSelectedComplaint(c)}
          >
            <div className="p-5 space-y-2">
              <p className="text-gray-600 text-sm"><strong>User:</strong> {c.user?.fullName || "Anonymous"}</p>
              <p className="text-gray-800 font-semibold text-lg">{c.title}</p>
              <p className="text-gray-700 text-sm"><strong>Severity:</strong> {c.severity}</p>
              <p className="text-gray-700 text-sm"><strong>Status:</strong> {c.status}</p>
              <p className="text-gray-700 text-sm"><strong>Assigned To:</strong> {c.assigned_to?.name || "Unassigned"}</p>
              <p className="text-gray-700 text-sm"><strong>Upvotes:</strong> {c.upvotes || 0}</p>
              {c.image && (
                <img
                  src={`http://localhost:5000/uploads/complaints/${c.image}`}
                  alt="Complaint"
                  className="w-full h-48 object-cover rounded-xl mt-2 border border-gray-100"
                  loading="lazy"
                />
              )}
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 border-t border-gray-100">
              {getStatusBadge(c.status)}
              <button
                className="px-3 py-1 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 shadow"
                onClick={(e) => { e.stopPropagation(); handleDelete(c._id); }}
              >
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>

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
              {/* Status, Severity, Assign Authority & Notes (same as before) */}
              {/* Use same modal content as your code */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageComplaints;
