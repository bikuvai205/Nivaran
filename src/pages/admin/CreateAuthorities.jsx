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
  const [created, setCreated] = useState(null);
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

  // ✅ Updated handleSubmit to send username + phone too
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    try {
      const res = await axios.post("http://localhost:5000/api/authorities/register", {
        name: form.officeName,   // office name stored as "name" in DB
        username: form.username, // ✅ added
        email: form.email,
        phone: form.phone,       // ✅ added
        password: form.password,
        type: form.type,
      });

      setCreated(res.data);
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
    setCreated(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-50 p-6 flex justify-center items-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 border border-rose-100">

        {/* 🔙 Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-rose-600 hover:text-rose-800 mb-6"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </button>

        {/* title */}
        <h1 className="text-3xl font-bold text-rose-700 mb-2">Create Authority</h1>
        <p className="text-gray-600 mb-6">
          Register a new authority. These credentials will be used for login.
        </p>

        {error && <p className="text-rose-600 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* authority type */}
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

          {/* office name */}
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

          {/* email + phone */}
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

          {/* username + password */}
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

          {/* buttons */}
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

        {/* success card */}
        {created && (
          <div className="mt-6 border rounded-xl p-4 bg-green-50 shadow-sm">
            <h2 className="font-semibold text-green-700 mb-2">Authority Created</h2>
            <p className="text-sm text-green-700">
              ✅ {created.authority?.name} ({created.authority?.username}) has been registered.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
