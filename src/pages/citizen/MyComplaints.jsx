import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapPin, ArrowUp, ArrowDown, Edit, Trash2 } from "lucide-react";

const MyComplaints = ({ citizen, token }) => {
  const [complaints, setComplaints] = useState([]);
  const [activePhase, setActivePhase] = useState("pending");
  const [loading, setLoading] = useState(true);

  // Editing modal state
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [formData, setFormData] = useState({ title: "", description: "", location: "" });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Deletion state
  const [deletingComplaint, setDeletingComplaint] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const res = await axios.get("https://nivaran-backend-zw9j.onrender.com/api/complaints/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setComplaints(res.data || []);
      } catch (err) {
        console.error("Error fetching complaints:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchComplaints();
  }, [token]);

  const filtered = complaints.filter((c) => c.status === activePhase);

  // Edit handlers
  const handleEditClick = (complaint) => {
    setEditingComplaint(complaint);
    setFormData({
      title: complaint.title || "",
      description: complaint.description || "",
      location: complaint.location || "",
    });
    setErrorMsg("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleUpdateComplaint = async () => {
    if (!editingComplaint) return;
    setSaving(true);
    setErrorMsg("");

    try {
      const res = await axios.put(
        `https://nivaran-backend-zw9j.onrender.com/api/complaints/${editingComplaint._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = res.data;
      setComplaints((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
      setEditingComplaint(null);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to update complaint");
    } finally {
      setSaving(false);
    }
  };

  // Delete handlers
  const handleDeleteComplaint = async () => {
    if (!deletingComplaint) return;
    setDeleting(true);
    try {
      await axios.delete(`https://nivaran-backend-zw9j.onrender.com/api/complaints/${deletingComplaint._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints((prev) => prev.filter((c) => c._id !== deletingComplaint._id));
      setDeletingComplaint(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete complaint");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 md:p-8 lg:p-10 bg-gradient-to-br from-rose-50/50 via-white to-pink-50/50">
      <h2 className="text-3xl sm:text-4xl mt-[15px] font-extrabold text-rose-600 mb-8 border-b-2 border-rose-300/50 pb-3 backdrop-blur-sm">
        My Complaints
      </h2>

      {/* Toggle buttons */}
      <div className="flex flex-wrap gap-3 sm:gap-4 mb-8">
        {["pending", "assigned", "inprogress", "resolved"].map((phase) => (
          <button
            key={phase}
            onClick={() => setActivePhase(phase)}
            className={`px-4 sm:px-5 py-2 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 hover:shadow-md ${
              activePhase === phase
                ? "bg-rose-600 text-white"
                : "bg-rose-100/50 text-rose-700 hover:bg-rose-200/50"
            }`}
          >
            {phase.charAt(0).toUpperCase() + phase.slice(1)}
          </button>
        ))}
      </div>

      {/* Complaint list */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-gray-600 text-base sm:text-lg">No complaints in {activePhase} phase.</p>
      ) : (
        <div className="space-y-8">
          {filtered.map((c) => (
            <div
              key={c._id}
              className="bg-rose-100/30 backdrop-blur-md shadow-lg rounded-2xl border border-rose-300/50 overflow-hidden transition-all duration-300"
            >
              <div className="px-4 sm:px-6 pt-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                  <span className="font-semibold text-rose-700 text-base sm:text-lg">
                    {c.anonymous ? "Anonymous" : citizen?.fullName}
                  </span>
                  <span className="text-sm text-gray-600 mt-2 sm:mt-0">
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-1">{c.title}</h3>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <MapPin size={16} className="mr-1 text-rose-500" />
                  <span>{c.location || "N/A"}</span>
                </div>
                <hr className="border-rose-200/50 border-[1.2px] mb-3 mt-3" />
              </div>

              <div className="px-4 sm:px-6 pb-4">
                <p className="text-gray-700 text-base">{c.description}</p>
                {c.image && (
                  <img
                    src={c.image}
                    alt="Complaint"
                    className="mt-4 rounded-xl max-h-48 sm:max-h-64 w-full object-contain border border-rose-200/50"
                  />
                )}
              </div>

              <div className="px-4 sm:px-6 py-3 bg-rose-50/30 border-t border-rose-200/50 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="flex space-x-6">
                  <div className="flex items-center text-gray-400 cursor-not-allowed">
                    <ArrowUp size={20} className="mr-1" strokeWidth={5} />
                    <span className="text-base">{c.upvotes}</span>
                  </div>
                  <div className="flex items-center text-gray-400 cursor-not-allowed">
                    <ArrowDown size={20} className="mr-1" strokeWidth={5} />
                    <span className="text-base">{c.downvotes}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 mt-3 sm:mt-0">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      c.status === "pending"
                        ? "bg-yellow-100/50 text-yellow-700"
                        : c.status === "assigned"
                        ? "bg-orange-100/50 text-orange-700"
                        : c.status === "inprogress"
                        ? "bg-blue-100/50 text-blue-700"
                        : "bg-green-100/50 text-green-700"
                    }`}
                  >
                    {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                  </span>

                  {/* Edit + Delete buttons only for pending */}
                  {c.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleEditClick(c)}
                        className="text-rose-600 hover:text-rose-700 transition-all duration-200"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => setDeletingComplaint(c)}
                        className="text-rose-600 hover:text-rose-700 transition-all duration-200"
                      >
                        <Trash2 size={20} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingComplaint && (
        <div className="fixed inset-0 flex items-center justify-center bg-rose-100/50 backdrop-blur-sm z-50">
          <div className="bg-rose-100/30 backdrop-blur-md rounded-2xl p-6 sm:p-8 w-full max-w-md sm:max-w-lg shadow-xl border border-rose-300/50">
            <h3 className="text-xl sm:text-2xl font-bold text-rose-600 mb-4">Edit Complaint</h3>
            {errorMsg && (
              <p className="text-base text-red-600 bg-red-50/50 rounded-lg px-4 py-2 border border-red-300/50 mb-4">{errorMsg}</p>
            )}
            <div className="space-y-4">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full border border-rose-300/50 rounded-xl px-4 py-3 bg-rose-50/50 backdrop-blur-sm focus:ring-2 focus:ring-rose-400 text-gray-800 text-base shadow-sm"
                placeholder="Complaint title"
              />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full border border-rose-300/50 rounded-xl px-4 py-3 bg-rose-50/50 backdrop-blur-sm focus:ring-2 focus:ring-rose-400 text-gray-800 text-base shadow-sm"
                rows={5}
                placeholder="Complaint description"
              />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full border border-rose-300/50 rounded-xl px-4 py-3 bg-rose-50/50 backdrop-blur-sm focus:ring-2 focus:ring-rose-400 text-gray-800 text-base shadow-sm"
                placeholder="Location"
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingComplaint(null)}
                className="px-4 sm:px-5 py-2 rounded-xl border border-rose-300/50 text-rose-700 bg-rose-50/50 hover:bg-rose-100/50 font-semibold text-base transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateComplaint}
                disabled={saving}
                className={`px-4 sm:px-5 py-2 rounded-xl font-semibold text-white text-base transition-all duration-200 ${
                  saving ? 'bg-rose-300 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700 hover:shadow-md'
                }`}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingComplaint && (
        <div className="fixed inset-0 flex items-center justify-center bg-rose-100/50 backdrop-blur-sm z-50">
          <div className="bg-rose-100/30 backdrop-blur-md rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-xl border border-rose-300/50">
            <h3 className="text-xl sm:text-2xl font-bold text-rose-600 mb-4">Delete Complaint</h3>
            <p className="text-rose-700 text-base mb-6">
              Are you sure you want to delete <strong>{deletingComplaint.title}</strong>? This cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeletingComplaint(null)}
                className="px-4 sm:px-5 py-2 rounded-xl border border-rose-300/50 text-rose-700 bg-rose-50/50 hover:bg-rose-100/50 font-semibold text-base transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteComplaint}
                disabled={deleting}
                className={`px-4 sm:px-5 py-2 rounded-xl font-semibold text-white text-base transition-all duration-200 ${
                  deleting ? 'bg-rose-300 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700 hover:shadow-md'
                }`}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyComplaints;
