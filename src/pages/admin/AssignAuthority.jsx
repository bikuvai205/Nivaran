import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const AssignAuthority = () => {
  const { complaintId } = useParams();
  const navigate = useNavigate();

  const [authorities, setAuthorities] = useState([]);
  const [filter, setFilter] = useState("All"); // Department filter
  const [statusFilter, setStatusFilter] = useState("Free"); // Status filter
  const [search, setSearch] = useState("");
  const [departments, setDepartments] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  const token = localStorage.getItem("adminToken");

  const fetchAuthorities = async () => {
    if (!token) return;

    try {
      // Fetch all authorities
      const authRes = await axios.get("http://localhost:5000/api/authorities", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const authoritiesData = authRes.data || [];

      // Fetch all complaints to determine busy authorities
      const complaintRes = await axios.get(
        "http://localhost:5000/api/complaints/admin",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const complaints = complaintRes.data || [];

      // Map authorities with status
      const authoritiesWithStatus = authoritiesData.map((auth) => {
        const assigned = complaints.some(
          (c) =>
            c.assigned_to &&
            c.assigned_to._id.toString() === auth._id.toString()
        );
        return {
          ...auth,
          status: assigned ? "Busy" : "Free",
        };
      });

      setAuthorities(authoritiesWithStatus);

      // Set departments for filter dropdown
      const deptList = ["All", ...new Set(authoritiesWithStatus.map((a) => a.type))];
      setDepartments(deptList);
    } catch (err) {
      console.error("Error fetching authorities or complaints:", err);
    }
  };

  useEffect(() => {
    fetchAuthorities();
  }, [token]);

  const handleAssign = async (authorityId) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/complaints/assign",
        { complaintId, authorityId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setToastMessage(res.data.message || "Authority assigned successfully");
      setTimeout(() => setToastMessage(null), 2000);

      // Refresh authorities after assignment
      fetchAuthorities();
    } catch (err) {
      console.error("Failed to assign authority:", err);
      alert("Failed to assign authority");
    }
  };

  const filteredAuthorities = (authorities || [])
    .filter((auth) => statusFilter === "All" || auth.status === statusFilter)
    .filter((auth) => filter === "All" || auth.type === filter)
    .filter((auth) => {
      const searchText = search.toLowerCase();
      return (
        auth.username?.toLowerCase().includes(searchText) ||
        auth.email?.toLowerCase().includes(searchText) ||
        auth.name?.toLowerCase().includes(searchText)
      );
    });

  return (
    <div className="p-10 min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-rose-200 hover:bg-rose-300 text-rose-700 font-semibold rounded-xl shadow-sm transition"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-rose-700">Active Authorities</h1>

        <div className="flex gap-2 w-full sm:w-auto">
          {/* Department filter */}
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

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-rose-200 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-400 focus:outline-none bg-white text-rose-700"
          >
            <option value="Free">Free</option>
            <option value="Busy">Busy</option>
            <option value="All">All</option>
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
                <th className="px-6 py-3 text-left text-sm font-semibold text-rose-700">Status</th>
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
                  <td className={`px-6 py-4 text-sm font-semibold ${auth.status === "Free" ? "text-green-600" : "text-red-600"}`}>
                    {auth.status}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => handleAssign(auth._id)}
                      disabled={auth.status === "Busy"}
                      className={`px-3 py-1 rounded-xl shadow-sm transition ${auth.status === "Busy" ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 text-white"}`}     
                    >
                      Assign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

export default AssignAuthority;
