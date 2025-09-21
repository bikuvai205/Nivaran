import React, { useState } from "react";
import { Eye, EyeOff, RotateCcw, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function CreateAuthorities() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    type: "",
    officeName: "",
    email: "",
    phone: "",
    username: "",
    password: "",
  });

  const [showPwd, setShowPwd] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState("");

  const passwordValid = form.password.length >= 8;

  const isValid =
    form.type &&
    form.officeName.trim().length >= 2 &&
    form.email.includes("@") &&
    form.phone.length >= 6 &&
    form.username.trim().length >= 3 &&
    passwordValid;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    try {
      const res = await axios.post("http://localhost:5000/api/authorities/register", {
        name: form.officeName,
        username: form.username,
        email: form.email,
        phone: form.phone,
        password: form.password,
        type: form.type,
      });

      handleReset();
      setToast({
        message: `✅ ${res.data.authority?.name} (${res.data.authority?.username}) has been registered.`,
        type: "success",
      });
      setTimeout(() => setToast(null), 4000);
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Server error");
    }
  };

  const handleReset = () => {
    setForm({
      type: "",
      officeName: "",
      email: "",
      phone: "",
      username: "",
      password: "",
    });
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-50 p-6 flex justify-center items-center">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 px-5 py-3 rounded-2xl text-white font-semibold text-base shadow-xl backdrop-blur-md border border-rose-300/50 z-50
            ${toast.type === "success" ? "bg-rose-600/95" : "bg-red-600/95"}`}
        >
          {toast.message}
        </div>
      )}

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 border border-rose-100">
        {/* Back Button */}
        <button
          onClick={() => navigate("/homepage")}
          className="p-2 mr-4 rounded-full hover:bg-rose-300 transition"
        >
          <ArrowLeft size={24} className="text-rose-700" />
        </button>

        {/* Title */}
        <h1 className="text-3xl font-bold text-rose-700 mb-2">Create Authority</h1>
        <p className="text-gray-600 mb-6">
          Register a new authority. These credentials will be used for login.
        </p>

        {error && <p className="text-rose-600 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Authority Type */}
          <div>
            <label className="block text-sm font-medium mb-1">Authority Type *</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-rose-400"
            >
              <option value="">Select type</option>
              <option value="Ward Police Unit">Ward Police Unit</option>
              <option value="Garbage Disposal Unit">Garbage Disposal Unit</option>
              <option value="Infrastructure Development Unit">Infrastructure Development Unit</option>
              <option value="Electricity Authority Unit">Electricity Authority Unit</option>
              <option value="Water Supply Unit">Water Supply Unit</option>
              <option value="Vetenary Unit">Vetenery Unit</option>
              <option value="Animal Control Unit">Animal Control Unit</option>
            </select>
          </div>

          {/* Office Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Unit Name *</label>
            <input
              type="text"
              name="officeName"
              value={form.officeName}
              onChange={handleChange}
              className="w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-rose-400"
            />
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-rose-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone *</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>

          {/* Username + Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username *</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-rose-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password *</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border px-3 py-2 pr-10 focus:ring-2 focus:ring-rose-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {!passwordValid && form.password && (
                <p className="text-xs text-rose-600 mt-1">
                  Password must be at least 8 characters
                </p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center gap-2"
            >
              <RotateCcw size={16} /> Reset
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="px-6 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
            >
              Create Authority
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}