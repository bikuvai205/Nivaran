import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ✅ import useNavigate

const ManageCitizens = () => {
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // ✅ initialize navigate

  // Fetch citizens from backend
  useEffect(() => {
    const fetchCitizens = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/citizens");
        setCitizens(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching citizens:", error);
        setLoading(false);
      }
    };

    fetchCitizens();
  }, []);

  // Delete citizen
  const handleDelete = async (email) => {
  if (!window.confirm(`Are you sure you want to delete ${email}?`)) return;

  try {
    // Encode the email for URL
    const encodedEmail = encodeURIComponent(email);
    console.log("Encoded Email:", encodedEmail);

    await axios.delete(`http://localhost:5000/api/citizens/email/${encodedEmail}`);
   
    setCitizens((prev) => prev.filter((c) => c.email !== email));
    alert(`Citizen ${email} deleted successfully!`);
  } catch (error) {
    console.log("Error deleting citizen:", error.response || error);
    alert("Failed to delete citizen. See console for details.");
  }
};



  if (loading) {
    return <p className="text-center mt-10">Loading citizens...</p>;
  }

  return (
    <div className="min-h-screen bg-rose-50 p-10">
      <h1 className="text-2xl font-bold text-rose-700 mb-6">Manage Citizens</h1>

      {/* Back Button */}
      <button
        onClick={() => navigate("/HomePage")} // ✅ use navigate correctly
        className="mb-6 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
      >
        &larr; Back
      </button>

      <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
        <table className="min-w-full text-sm text-left border border-gray-200 rounded-lg">
          <thead className="bg-rose-100 text-rose-700">
            <tr>
              <th className="px-6 py-3">Full Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Joined On</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {citizens.map((citizen) => (
              <tr key={citizen._id} className="border-b hover:bg-rose-50">
                <td className="px-6 py-3">{citizen.fullName}</td>
                <td className="px-6 py-3">{citizen.email}</td>
                <td className="px-6 py-3">
                  {new Date(citizen.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-3">
                  <button
                    onClick={() => handleDelete(citizen.email)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {citizens.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  No citizens found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageCitizens;
