import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const VerifiedAuthorities = () => {
  const navigate = useNavigate();
  const [authorities, setAuthorities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All Departments");
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null); // email to delete
  const [toastMessage, setToastMessage] = useState("");

  // Fetch authorities
  const fetchAuthorities = async () => {
    try {
      const res = await axios.get("https://nivaran-backend-zw9j.onrender.com/api/authorities");
      setAuthorities(res.data);
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Failed to load authorities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthorities();
  }, []);

  // Delete authority by email
  const handleDelete = async (email) => {
    try {
      const encodedEmail = encodeURIComponent(email);
      await axios.delete(`https://nivaran-backend-zw9j.onrender.com/api/authorities/email/${encodedEmail}`);
      setAuthorities((prev) => prev.filter((a) => a.email !== email));
      setToastMessage(`Authority ${email} deleted successfully!`);
      setConfirmDelete(null);

      setTimeout(() => setToastMessage(""), 3000);
    } catch (error) {
      console.error("Delete error:", error.response || error);
      setToastMessage("Failed to delete authority");
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  if (loading)
    return (
      <p className="p-10 text-center text-rose-700 font-semibold">
        Loading authorities...
      </p>
    );

  // Filter and search
  const departments = ["All Departments", ...new Set(authorities.map((a) => a.type))];
  const filteredAuthorities = authorities
    .filter((a) => filter === "All Departments" || a.type === filter)
    .filter((a) => 
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.username.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="p-10 min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
       <button
          onClick={() => navigate("/homepage")}
          className="p-2 mr-4 rounded-full hover:bg-rose-300 transition"
        >
          <ArrowLeft size={24} className="text-rose-700" />
        </button>

        <h1 className="text-3xl font-bold text-rose-700">Active Authorities</h1>

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-rose-200 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-400 focus:outline-none bg-white text-rose-700"
          >
            {departments.map((dept, idx) => (
              <option key={idx} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search by name, email, username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-rose-200 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-400 focus:outline-none bg-white text-rose-700"
          />
        </div>
      </div>

      {/* Table */}
      {filteredAuthorities.length === 0 ? (
        <p className="text-gray-600">No authorities found.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-lg rounded-2xl border border-rose-100">
          <table className="min-w-full divide-y divide-rose-200">
            <thead className="bg-rose-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-rose-700">Authority Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-rose-700">Unit Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-rose-700">Username</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-rose-700">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-rose-700">Phone</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-rose-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-200">
              {filteredAuthorities.map((auth) => (
                <tr key={auth._id} className="hover:bg-rose-50 transition">
                  <td className="px-6 py-4 text-sm text-rose-700 font-medium">{auth.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{auth.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{auth.username}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{auth.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{auth.phone}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => setConfirmDelete(auth.email)}
                      className="px-3 py-1 bg-red-200 hover:bg-red-300 text-red-700 rounded-xl shadow-sm transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-lg text-center">
            <h2 className="text-lg font-semibold text-rose-700 mb-4">Confirm Deletion</h2>
            <p className="mb-6 text-gray-700">
              Are you sure you want to delete <strong>{confirmDelete}</strong>?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-slide-up">
          {toastMessage}
        </div>
      )}

      <style>
        {`
          @keyframes slide-up {
            from { opacity: 0; transform: translate(-50%, 50%); }
            to { opacity: 1; transform: translate(-50%, 0); }
          }
          .animate-slide-up {
            animation: slide-up 0.3s ease-out;
          }
        `}
      </style>
    </div>
  );
};

export default VerifiedAuthorities;
