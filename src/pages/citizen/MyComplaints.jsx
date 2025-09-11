// src/pages/citizen/MyComplaints.jsx
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
        const res = await axios.get("http://localhost:5000/api/complaints/mine", {
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
        `http://localhost:5000/api/complaints/${editingComplaint._id}`,
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
      await axios.delete(`http://localhost:5000/api/complaints/${deletingComplaint._id}`, {
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
    <div className="p-6">
      <h2 className="text-2xl font-bold text-rose-600 mb-4">My Complaints</h2>

      {/* Toggle buttons */}
      <div className="flex space-x-4 mb-6">
        {["pending", "inprogress", "resolved"].map((phase) => (
          <button
            key={phase}
            onClick={() => setActivePhase(phase)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              activePhase === phase
                ? "bg-rose-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {phase.charAt(0).toUpperCase() + phase.slice(1)}
          </button>
        ))}
      </div>

      {/* Complaint list */}
      {loading ? (
        <p className="text-gray-500">Loading your complaints...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">No complaints in {activePhase} phase.</p>
      ) : (
        <div className="space-y-6">
          {filtered.map((c) => (
            <div key={c._id} className="bg-white shadow-md rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-blue-800">
                    {c.anonymous ? "Anonymous" : citizen?.fullName}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{c.title}</h3>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin size={16} className="mr-1 text-rose-500" />
                  <span>{c.location || "N/A"}</span>
                </div>
                <hr className="border-gray-300 border-[1.2px] mb-3 mt-3" />
              </div>

              <div className="px-6 pb-4">
                <p className="text-gray-700">{c.description}</p>
                {c.image && (
                  <img
                    src={`http://localhost:5000/uploads/complaints/${c.image}`}
                    alt="Complaint"
                    className="mt-3 rounded-lg max-h-64 object-contain"
                  />
                )}
              </div>

              <div className="px-6 py-3 bg-gray-50 border-t flex items-center justify-between">
                <div className="flex space-x-6">
                  <div className="flex items-center text-gray-400 cursor-not-allowed">
                  onMouseDown={e => e.preventDefault()}
                  <span className="select-none">
                    <ArrowUp size={18} className="mr-1" />
                    {c.upvotes}</span>
                  </div>
                  <div className="flex items-center text-gray-400 cursor-not-allowed">
                  onMouseDown={e => e.preventDefault()}
                    <ArrowDown size={18} className="mr-1" />
                    <span>{c.downvotes}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      c.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : c.status === "inprogress"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                  </span>

                  {/* Edit + Delete buttons for pending only */}
                  {c.status === "pending" && (
                    <>
                      <button onClick={() => handleEditClick(c)} className="text-blue-600 hover:text-blue-800">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => setDeletingComplaint(c)} className="text-red-600 hover:text-red-800">
                        <Trash2 size={18} />
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-rose-600">Edit Complaint</h3>
            {errorMsg && <p className="text-sm text-red-600 mb-2">{errorMsg}</p>}
            <div className="space-y-3">
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full border rounded-lg p-2" />
              <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full border rounded-lg p-2" rows={5} />
              <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full border rounded-lg p-2" />
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button onClick={() => setEditingComplaint(null)} className="px-4 py-2 rounded-lg bg-gray-200">Cancel</button>
              <button onClick={handleUpdateComplaint} disabled={saving} className="px-4 py-2 rounded-lg bg-rose-600 text-white">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingComplaint && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-red-600">Delete Complaint</h3>
            <p className="text-gray-700 mb-4">Are you sure you want to delete <strong>{deletingComplaint.title}</strong>? This cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setDeletingComplaint(null)} className="px-4 py-2 rounded-lg bg-gray-200">Cancel</button>
              <button onClick={handleDeleteComplaint} disabled={deleting} className="px-4 py-2 rounded-lg bg-red-600 text-white">
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
