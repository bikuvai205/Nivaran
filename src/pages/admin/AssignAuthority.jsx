import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";

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

  const token = localStorage.getItem("adminToken");

  const fetchAuthorities = async () => {
    if (!token) return;
    try {
      const authRes = await axios.get("https://nivaran-backend-zw9j.onrender.com/api/authorities", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const authoritiesData = authRes.data || [];

      const complaintRes = await axios.get(
        "https://nivaran-backend-zw9j.onrender.com/api/complaints/admin",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const complaints = complaintRes.data || [];

      const authoritiesWithStatus = authoritiesData.map((auth) => {
        // Find a complaint assigned to this authority
        const assignedComplaint = complaints.find(
          (c) =>
            c.assigned_to &&
            c.assigned_to._id.toString() === auth._id.toString()
        );

        let status = "Free";
        if (assignedComplaint) {
          if (assignedComplaint.status === "assigned") status = "Assigned";
          else if (assignedComplaint.status === "inprogress") status = "Busy";
          else status = "Free";
        }

        return { ...auth, status };
      });

      setAuthorities(authoritiesWithStatus);
      const deptList = ["All", ...new Set(authoritiesWithStatus.map((a) => a.type))];
      setDepartments(deptList);
    } catch (err) {
      console.error("Error fetching authorities:", err);
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

    // Show toast
    setToastMessage(res.data.message || "Authority assigned successfully");
    setTimeout(() => setToastMessage(null), 2000);

    // Redirect to ManageComplaints page after assignment
    navigate("/admin/manage-complaints"); // <-- added this line

    setConfirmAuthority(null);
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
          className="p-2 mr-4 rounded-full hover:bg-rose-300 transition"
        >
          <ArrowLeft size={24} className="text-rose-700" />
        </button>

        <h1 className="text-3xl font-bold text-rose-700">Authority Status</h1>

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-rose-200 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-400 focus:outline-none bg-white text-rose-700"
          >
            {departments.map((dept, idx) => (
              <option key={idx} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-rose-200 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-400 focus:outline-none bg-white text-rose-700"
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
                {complaintId && <th className="px-6 py-3 text-left text-sm font-semibold text-rose-700">Actions</th>}
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
                  <td className={`px-6 py-4 text-sm font-semibold ${
                    auth.status === "Free" ? "text-green-600" :
                    auth.status === "Assigned" ? "text-orange-600" :
                    "text-red-600"
                  }`}>
                    {auth.status}
                  </td>
                  {complaintId && (
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => setConfirmAuthority(auth)}
                        disabled={auth.status !== "Free"} // only free can be assigned
                        className={`px-3 py-1 rounded-xl shadow-sm transition ${
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
      )}

      {/* Confirmation modal */}
      {complaintId && confirmAuthority && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80 text-center">
            <h2 className="text-xl font-bold mb-4 text-rose-700">Confirm Assignment</h2>
            <p className="mb-6">
              Are you sure you want to assign this complaint to <strong>{confirmAuthority.username}</strong> of<strong> {confirmAuthority.name}</strong>?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleAssign(confirmAuthority._id)}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl shadow"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmAuthority(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl shadow"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
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
