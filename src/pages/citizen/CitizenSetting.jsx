import React, { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const CitizenSetting = ({ token }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Validation: all fields filled
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }

    // Validation: new password matches confirm
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match", {
        style: { borderRadius: '10px', background: '#f87171', color: '#fff' },
        icon: '❌'
      });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put(
        "http://localhost:5000/api/citizens/change-password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(res.data.message, { 
        style: { borderRadius: '10px', background: '#4ade80', color: '#fff' }, 
        icon: '✅' 
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";
      toast.error(msg, {
        style: { borderRadius: '10px', background: '#f87171', color: '#fff' },
        icon: '❌'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg mt-6">
      <Toaster position="top-right" reverseOrder={false} />
      <h2 className="text-2xl font-bold text-rose-600 mb-4">Change Password</h2>
      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-400 outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-400 outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-400 outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-rose-600 text-white font-semibold py-2 px-4 rounded-xl hover:bg-rose-700 transition"
        >
          {loading ? "Updating..." : "Change Password"}
        </button>
      </form>
    </div>
  );
};

export default CitizenSetting;
