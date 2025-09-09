import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ManageCitizens = () => {
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // Fetch citizens
  useEffect(() => {
    const fetchCitizens = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/citizens");
        setCitizens(res.data);
      } catch (error) {
        console.error("Error fetching citizens:", error);
        alert("Failed to load citizens");
      } finally {
        setLoading(false);
      }
    };
    fetchCitizens();
  }, []);

  // Delete citizen
  const handleDelete = async (email) => {
    if (!window.confirm(`Are you sure you want to delete ${email}?`)) return;

    try {
      const encodedEmail = encodeURIComponent(email);
      await axios.delete(`http://localhost:5000/api/citizens/email/${encodedEmail}`);
      setCitizens((prev) => prev.filter((c) => c.email !== email));
      alert(`Citizen ${email} deleted successfully!`);
    } catch (error) {
      console.error("Delete error:", error.response || error);
      alert("Failed to delete citizen");
    }
  };

  // Filtered citizens by search
  const filteredCitizens = citizens.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="p-10 text-center text-rose-700 font-semibold">Loading citizens...</p>;

  return (
    <div className="p-10 min-h-screen bg-gradient-to-br from-rose-50 to-pink-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <button
          onClick={() => navigate("/HomePage")}
          className="px-4 py-2 bg-rose-200 hover:bg-rose-300 text-rose-700 font-semibold rounded-xl shadow-sm transition"
        >
          &larr; Back
        </button>
        <h1 className="text-3xl font-bold text-rose-700">Manage Citizens</h1>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-rose-200 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-400 focus:outline-none bg-white text-rose-700 w-full sm:w-64"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-2xl border border-rose-100">
        <table className="min-w-full divide-y divide-rose-200">
          <thead className="bg-rose-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-rose-700">Full Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-rose-700">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-rose-700">Joined On</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-rose-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rose-200">
            {filteredCitizens.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">
                  No citizens found.
                </td>
              </tr>
            ) : (
              filteredCitizens.map((citizen) => (
                <tr key={citizen._id} className="hover:bg-rose-50 transition">
                  <td className="px-6 py-4 text-gray-800">{citizen.fullName}</td>
                  <td className="px-6 py-4 text-gray-800">{citizen.email}</td>
                  <td className="px-6 py-4 text-gray-800">
                    {new Date(citizen.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => handleDelete(citizen.email)}
                      className="px-3 py-1 bg-red-200 hover:bg-red-300 text-red-700 rounded-xl shadow-sm transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageCitizens;
