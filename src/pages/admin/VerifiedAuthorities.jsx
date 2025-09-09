import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const VerifiedAuthorities = () => {
  const navigate = useNavigate();
  const [authorities, setAuthorities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All Departments");
  const [search, setSearch] = useState("");

  // Fetch authorities
  const fetchAuthorities = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/authorities");
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
  if (!window.confirm(`Are you sure you want to delete ${email}?`)) return;

  try {
    const encodedEmail = encodeURIComponent(email);
    const res = await fetch(`http://localhost:5000/api/authorities/email/${encodedEmail}`, {
      method: "DELETE",
    });
    const data = await res.json();

    if (res.ok) {
      alert(data.message);
      fetchAuthorities(); // Refresh the list
    } else {
      alert(data.message || "Delete failed");
    }
  } catch (error) {
    console.error("Delete error:", error);
    alert("Something went wrong!");
  }
};


  if (loading) return <p className="p-10 text-center text-rose-700 font-semibold">Loading...</p>;

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
    <div className="p-10 min-h-screen bg-gradient-to-br from-rose-50 to-pink-100">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-rose-200 hover:bg-rose-300 text-rose-700 font-semibold rounded-xl shadow-sm transition"
        >
          ← Back
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
                      onClick={() => handleDelete(auth.email)}
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
    </div>
  );
};

export default VerifiedAuthorities;
