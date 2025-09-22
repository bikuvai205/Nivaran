import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

const COLORS = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#8AFF33",
  "#FF8A33",
  "#33FFD5",
  "#9B33FF",
];
const STATUS_COLORS = {
  Pending: "#FF6384",
  Assigned: "#36A2EB",
  "In Progress": "#FFCE56",
  Resolved: "#8AFF33",
};

const AdminDashboardHome = () => {
  const token = localStorage.getItem("adminToken");
  const navigate = useNavigate();

  // ---------- STATES ----------
  const [summary, setSummary] = useState(null);
  const [statusData, setStatusData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);

  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [loadingTrend, setLoadingTrend] = useState(true);

  const [error, setError] = useState(null);

  // ---------- FETCH SUMMARY ----------
  const fetchSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await axios.get(
        "https://nivaran-backend-zw9j.onrender.com/api/admin/dashboard/summary",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Summary:", res.data);
      setSummary(res.data);
    } catch (err) {
      console.error("Summary fetch error:", err);
      setError("Failed to load summary.");
    } finally {
      setLoadingSummary(false);
    }
  };

  // ---------- FETCH STATUS ----------
  const fetchStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await axios.get(
        "https://nivaran-backend-zw9j.onrender.com/api/complaints/status-count",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Status:", res.data);
      setStatusData(
        res.data.map((s) => ({
          name:
            s.name.toLowerCase() === "pending"
              ? "Pending"
              : s.name.toLowerCase() === "resolved"
              ? "Resolved"
              : s.name.toLowerCase() === "assigned"
              ? "Assigned"
              : s.name.toLowerCase() === "inprogress"
              ? "In Progress"
              : s.name,
          value: s.value,
        }))
      );
    } catch (err) {
      console.error("Status fetch error:", err);
    } finally {
      setLoadingStatus(false);
    }
  };

  // ---------- FETCH CATEGORY ----------
  const fetchCategory = async () => {
    setLoadingCategory(true);
    try {
      const res = await axios.get(
        "https://nivaran-backend-zw9j.onrender.com/api/admin/dashboard/complaints-by-category",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Category:", res.data);
      setCategoryData(
        res.data.map((c, idx) => ({
          name: c._id || "Others",
          value: c.count,
          fill: COLORS[idx % COLORS.length],
        }))
      );
    } catch (err) {
      console.error("Category fetch error:", err);
    } finally {
      setLoadingCategory(false);
    }
  };

  // ---------- FETCH TREND ----------
  const fetchTrend = async () => {
    setLoadingTrend(true);
    try {
      const res = await axios.get(
        "https://nivaran-backend-zw9j.onrender.com/api/admin/dashboard/complaints-per-day",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Trend:", res.data);
      setTrendData(res.data);
    } catch (err) {
      console.error("Trend fetch error:", err);
    } finally {
      setLoadingTrend(false);
    }
  };
  // ---------- FETCH AUTHORITY PERFORMANCE (Optional) ----------
  const [authorityData, setAuthorityData] = useState([]);
  const [loadingAuthority, setLoadingAuthority] = useState(false);
  const fetchAuthorityPerformance = async () => {
    setLoadingAuthority(true);
    try {
      const res = await axios.get(
        "https://nivaran-backend-zw9j.onrender.com/api/admin/dashboard/authority-performance",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Authority Performance:", res.data);
      setAuthorityData(res.data);
    } catch (err) {
      console.error("Authority performance fetch error:", err);
    } finally {
      setLoadingAuthority(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSummary();
      fetchStatus();
      fetchCategory();
      fetchTrend();
      fetchAuthorityPerformance(); // Optional
    } else {
      setError("No admin token found. Please login again.");
    }
  }, [token]);

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center">
        <p className="text-red-500 font-semibold mb-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-6 space-y-8 bg-gradient-to-br from-rose-50/50 via-white to-pink-50/50">
      {/* Back Button */}
     <button
          onClick={() => navigate(-1)}
          className="p-2 mr-4 rounded-full hover:bg-rose-300 transition"
        >
          <ArrowLeft size={24} className="text-rose-700" />
        </button>

      <h2 className="text-3xl font-extrabold text-rose-600 mb-6 border-b-2 border-rose-200/50 pb-3">
        Admin Dashboard
      </h2>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loadingSummary ? (
          <div className="col-span-full flex justify-center items-center h-32">
            <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
          </div>
        ) : summary ? (
          Object.entries({
            "Total Authorities": summary.totalAuthorities,
            "Total Citizens": summary.totalCitizens,
            "Total Complaints": summary.totalComplaints,
            "Pending Complaints": summary.statusCounts?.pending || 0,
          }).map(([label, value]) => (
            <div
              key={label}
              className="bg-rose-100/30 backdrop-blur-md shadow-lg rounded-2xl p-6 flex flex-col items-center justify-center hover:shadow-xl hover:scale-105 transition-all duration-300 border border-rose-200/50"
            >
              <p className="text-gray-600 font-semibold text-sm">{label}</p>
              <p className="text-3xl font-bold text-rose-600 mt-2">{value}</p>
            </div>
          ))
        ) : null}
      </div>

      {/* AUTHORITY PERFORMANCE CHART */}
      <div className="bg-rose-100/30 shadow-lg rounded-2xl p-6 border border-rose-200/50">
        <h3 className="text-xl font-semibold text-rose-700 mb-4">
          Authority Performance by Type
        </h3>
        {loadingAuthority ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={authorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="resolved" fill="#8AFF33" name="Resolved" />
              <Bar dataKey="pending" fill="#FF6384" name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* STATUS PIE CHART */}
      <div className="bg-rose-100/30 shadow-lg rounded-2xl p-6 border border-rose-200/50">
        <h3 className="text-xl font-semibold text-rose-700 mb-4">
          Complaints by Status
        </h3>
        {loadingStatus ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {statusData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* CATEGORY BAR CHART */}
      <div className="bg-rose-100/30 shadow-lg rounded-2xl p-6 border border-rose-200/50">
        <h3 className="text-xl font-semibold text-rose-700 mb-4">
          Complaints by Category
        </h3>
        {loadingCategory ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" name="Complaints">
                {categoryData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* TREND LINE CHART */}
      <div className="bg-rose-100/30 shadow-lg rounded-2xl p-6 border border-rose-200/50">
        <h3 className="text-xl font-semibold text-rose-700 mb-4">
          Complaints Per Day
        </h3>
        {loadingTrend ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#FF6384"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardHome;
