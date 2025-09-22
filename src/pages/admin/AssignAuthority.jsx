import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

const AssignAuthority = () => {
  const { complaintId } = useParams();
  const navigate = useNavigate();

  const [authorities, setAuthorities] = useState([]);
  const [filter, setFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("Free");
  const [search, setSearch] = useState("");
  const [departments, setDepartments] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [confirmAuthority, setConfirmAuthority] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("adminToken");

  const fetchAuthorities = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const authRes = await axios.get(
        "https://nivaran-backend-zw9j.onrender.com/api/authorities",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const authoritiesData = authRes.data || [];

      const complaintRes = await axios.get(
        "https://nivaran-backend-zw9j.onrender.com/api/complaints/admin",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const complaints = complaintRes.data || [];

      const authoritiesWithStatus = authoritiesData.map((auth) => {
        const assignedComplaint = complaints.find(
          (c) => c.assigned_to && c.assigned_to._id.toString() === auth._id.toString()
        );
        let status = "Free";
        if (assignedComplaint) {
          if (assignedComplaint.status === "assigned") status = "Assigned";
          else if (assignedComplaint.status === "inprogress") status = "Busy";
          else status = "Free";
        }
        return { ...auth, status, isExpanded: false };
      });

      setAuthorities(authoritiesWithStatus);
      const deptList = ["All", ...new Set(authoritiesWithStatus.map((a) => a.type))];
      setDepartments(deptList);
    } catch (err) {
      console.error("Error fetching authorities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthorities();
  }, [token]);

  const handleAssign = async (authorityId) => {
    if (!complaintId) return;
    try {
      const res = await axios.post(
        "https://nivaran-backend-zw9j.onrender.com/api/complaints/assign",
        { complaintId, authorityId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setToastMessage(res.data.message || "Authority assigned successfully");
      setTimeout(() => setToastMessage(null), 2000);

      navigate("/admin/manage-complaints");
      setConfirmAuthority(null);
    } catch (err) {
      console.error("Failed to assign authority:", err);
      alert("Failed to assign authority");
    }
  };

  const toggleExpand = (id) => {
    setAuthorities((prev) =>
      prev.map((auth) =>
        auth._id === id ? { ...auth, isExpanded: !auth.isExpanded } : auth
      )
    );
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
    <div className="p-2 sm:p-4 md:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 relative">
      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-rose-700 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-rose-700 text-lg font-semibold">Fetching Authorities...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col items-center mb-4 sm:mb-6">
        <div className="flex items-center justify-between w-full mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-rose-300 transition"
          >
            <ArrowLeft size={20} className="text-rose-700" />
          </button>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-rose-700">
            Authority Status
          </h1>
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>

        {/* Collapsible Filters */}
        <div className="w-full">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center justify-between w-full px-4 py-2 bg-rose-200 rounded-xl text-rose-700 font-semibold mb-2"
          >
            Filters
            {isFilterOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {isFilterOpen && (
            <div className="flex flex-col gap-2 mb-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-rose-200 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-400 focus:outline-none bg-white text-rose-700 text-sm"
              >
                {departments.map((dept, idx) => (
                  <option key={idx} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-rose-200 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-400 focus:outline-none bg-white text-rose-700 text-sm"
              >
                <option value="Free">Free</option>
                <option value="Assigned">Assigned</option>
                <option value="Busy">Busy</option>
                <option value="All">All</option>
              </select>
              <input
                type="text"
                placeholder="Search by name, email, username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-2 border border-rose-200 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-400 focus:outline-none bg-white text-rose-700 text-sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* Data Display */}
      {filteredAuthorities.length === 0 ? (
        <p className="text-gray-600 text-center">No authorities found.</p>
      ) : (
        <div className="space-y-4">
          {/* Table for larger screens */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-rose-200 border border-rose-100 rounded-2xl shadow-lg bg-white">
              <thead className="bg-rose-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm md:text-base font-semibold text-rose-700">Type</th>
                  <th className="px-6 py-4 text-left text-sm md:text-base font-semibold text-rose-700">Unit Name</th>
                  <th className="px-6 py-4 text-left text-sm md:text-base font-semibold text-rose-700">Username</th>
                  <th className="px-6 py-4 text-left text-sm md:text-base font-semibold text-rose-700">Email</th>
                  <th className="px-6 py-4 text-left text-sm md:text-base font-semibold text-rose-700">Phone</th>
                  <th className="px-6 py-4 text-left text-sm md:text-base font-semibold text-rose-700">Status</th>
                  {complaintId && (
                    <th className="px-6 py-4 text-left text-sm md:text-base font-semibold text-rose-700">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-200">
                {filteredAuthorities.map((auth) => (
                  <tr key={auth._id} className="hover:bg-rose-50 transition">
                    <td className="px-6 py-4 text-sm md:text-base text-rose-700 font-medium">{auth.type}</td>
                    <td className="px-6 py-4 text-sm md:text-base text-gray-800">{auth.name}</td>
                    <td className="px-6 py-4 text-sm md:text-base text-gray-800">{auth.username}</td>
                    <td className="px-6 py-4 text-sm md:text-base text-gray-800">{auth.email}</td>
                    <td className="px-6 py-4 text-sm md:text-base text-gray-800">{auth.phone}</td>
                    <td
                      className={`px-6 py-4 text-sm md:text-base font-semibold ${
                        auth.status === "Free"
                          ? "text-green-600"
                          : auth.status === "Assigned"
                          ? "text-orange-600"
                          : "text-red-600"
                      }`}
                    >
                      {auth.status}
                    </td>
                    {complaintId && (
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setConfirmAuthority(auth)}
                          disabled={auth.status !== "Free"}
                          className={`px-4 py-2 rounded-xl shadow-sm transition text-sm md:text-base ${
                            auth.status !== "Free"
                              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                              : "bg-green-500 hover:bg-green-600 text-white"
                          }`}
                        >
                          Assign
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Card layout for smaller screens */}
          <div className="md:hidden space-y-3">
            {filteredAuthorities.map((auth) => (
              <div
                key={auth._id}
                className="bg-white rounded-xl shadow-md p-4 border border-rose-100"
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleExpand(auth._id)}
                >
                  <div>
                    <h3 className="text-sm font-semibold text-rose-700">{auth.name}</h3>
                    <p className="text-xs text-gray-600">{auth.type}</p>
                  </div>
                  <div
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      auth.status === "Free"
                        ? "bg-green-100 text-green-600"
                        : auth.status === "Assigned"
                        ? "bg-orange-100 text-orange-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {auth.status}
                  </div>
                </div>
                {auth.isExpanded && (
                  <div className="mt-3 text-xs text-gray-800 space-y-2">
                    <p><strong>Username:</strong> {auth.username}</p>
                    <p><strong>Email:</strong> {auth.email}</p>
                    <p><strong>Phone:</strong> {auth.phone}</p>
                    {complaintId && (
                      <button
                        onClick={() => setConfirmAuthority(auth)}
                        disabled={auth.status !== "Free"}
                        className={`w-full py-2 rounded-xl shadow-sm transition text-xs ${
                          auth.status !== "Free"
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600 text-white"
                        }`}
                      >
                        Assign
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {complaintId && confirmAuthority && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-5 w-11/12 max-w-sm text-center">
            <h2 className="text-lg font-bold mb-3 text-rose-700">Confirm Assignment</h2>
            <p className="mb-4 text-xs">
              Assign this complaint to <strong>{confirmAuthority.username}</strong> of{" "}
              <strong>{confirmAuthority.name}</strong>?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleAssign(confirmAuthority._id)}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl shadow text-sm"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmAuthority(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl shadow text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-xl shadow-lg z-50 animate-slide-up text-sm">
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
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .animate-spin {
            animation: spin 1s linear infinite;
          }
        `}
      </style>
    </div>
  );
};

export default AssignAuthority;