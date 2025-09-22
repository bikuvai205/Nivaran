import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

const ManageCitizens = () => {
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null); // email to delete
  const [toastMessage, setToastMessage] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch citizens
  useEffect(() => {
    const fetchCitizens = async () => {
      setLoading(true);
      try {
        const res = await axios.get("https://nivaran-backend-zw9j.onrender.com/api/citizens");
        setCitizens(res.data.map(citizen => ({ ...citizen, isExpanded: false })));
      } catch (error) {
        console.error("Error fetching citizens:", error);
        setToastMessage("Failed to load citizens");
        setTimeout(() => setToastMessage(""), 3000);
      } finally {
        setLoading(false);
      }
    };
    fetchCitizens();
  }, []);

  // Delete citizen
  const handleDelete = async (email) => {
    try {
      const encodedEmail = encodeURIComponent(email);
      await axios.delete(`https://nivaran-backend-zw9j.onrender.com/api/citizens/email/${encodedEmail}`);
      setCitizens((prev) => prev.filter((c) => c.email !== email));
      setToastMessage(`Citizen ${email} deleted successfully!`);
      setConfirmDelete(null);

      // Hide toast after 3 seconds
      setTimeout(() => setToastMessage(""), 3000);
    } catch (error) {
      console.error("Delete error:", error.response || error);
      setToastMessage("Failed to delete citizen");
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  const toggleExpand = (id) => {
    setCitizens((prev) =>
      prev.map((citizen) =>
        citizen._id === id ? { ...citizen, isExpanded: !citizen.isExpanded } : citizen
      )
    );
  };

  const filteredCitizens = citizens.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-2 sm:p-4 md:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 relative">
      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-rose-700 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-rose-700 text-lg font-semibold">Fetching Citizens...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col items-center mb-4 sm:mb-6">
        <div className="flex items-center justify-between w-full mb-4">
          <button
            onClick={() => navigate("/homepage")}
            className="p-2 rounded-full hover:bg-rose-300 transition"
          >
            <ArrowLeft size={20} className="text-rose-700" />
          </button>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-rose-700">
            Manage Citizens
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
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-2 border border-rose-200 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-400 focus:outline-none bg-white text-rose-700 text-sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* Data Display */}
      {filteredCitizens.length === 0 ? (
        <p className="text-gray-600 text-center">No citizens found.</p>
      ) : (
        <div className="space-y-4">
          {/* Table for larger screens */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-rose-200 border border-rose-100 rounded-2xl shadow-lg bg-white">
              <thead className="bg-rose-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm md:text-base font-semibold text-rose-700">Full Name</th>
                  <th className="px-6 py-4 text-left text-sm md:text-base font-semibold text-rose-700">Email</th>
                  <th className="px-6 py-4 text-left text-sm md:text-base font-semibold text-rose-700">Joined On</th>
                  <th className="px-6 py-4 text-left text-sm md:text-base font-semibold text-rose-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-200">
                {filteredCitizens.map((citizen) => (
                  <tr key={citizen._id} className="hover:bg-rose-50 transition">
                    <td className="px-6 py-4 text-sm md:text-base text-gray-800">{citizen.fullName}</td>
                    <td className="px-6 py-4 text-sm md:text-base text-gray-800">{citizen.email}</td>
                    <td className="px-6 py-4 text-sm md:text-base text-gray-800">
                      {new Date(citizen.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setConfirmDelete(citizen.email)}
                        className="px-4 py-2 bg-red-200 hover:bg-red-300 text-red-700 rounded-xl shadow-sm transition text-sm md:text-base"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Card layout for smaller screens */}
          <div className="md:hidden space-y-3">
            {filteredCitizens.map((citizen) => (
              <div
                key={citizen._id}
                className="bg-white rounded-xl shadow-md p-4 border border-rose-100"
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleExpand(citizen._id)}
                >
                  <div>
                    <h3 className="text-sm font-semibold text-rose-700">{citizen.fullName}</h3>
                    <p className="text-xs text-gray-600">{citizen.email}</p>
                  </div>
                  <div className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                    {new Date(citizen.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {citizen.isExpanded && (
                  <div className="mt-3 text-xs text-gray-800 space-y-2">
                    <p><strong>Email:</strong> {citizen.email}</p>
                    <p><strong>Joined On:</strong> {new Date(citizen.createdAt).toLocaleDateString()}</p>
                    <button
                      onClick={() => setConfirmDelete(citizen.email)}
                      className="w-full py-2 rounded-xl shadow-sm transition text-xs bg-red-200 hover:bg-red-300 text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-5 w-11/12 max-w-sm text-center">
            <h2 className="text-lg font-bold mb-3 text-rose-700">Confirm Deletion</h2>
            <p className="mb-4 text-xs">
              Are you sure you want to delete <strong>{confirmDelete}</strong>?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow text-sm"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl shadow text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
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

export default ManageCitizens;