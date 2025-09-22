import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// -------------------- CATEGORY & COLOR MAPPING --------------------
const CATEGORY_MAP = {
  Roads: "Infrastructural Development",
  Maintenance: "Infrastructural Development",
  Infrastructure: "Infrastructural Development",
  "Garbage/Waste/Pollution": "Pollution",
  Traffic: "Pollution",
  Water: "Drinking Water",
  Electricity: "Electricity",
  "Street Animal": "Street Animal",
  Environmental: "Environment",
  Others: "Others",
};

const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#8AFF33", "#FF8A33", "#33FFD5", "#9B33FF"];
const STATUS_COLORS = {
  Pending: "#FF6384",
  Assigned: "#36A2EB",
  "In Progress": "#FFCE56",
  Resolved: "#8AFF33",
};
const STATUS_MAP = {
  pending: "Pending",
  assigned: "Assigned",
  inprogress: "In Progress",
  resolved: "Resolved",
};

// -------------------- MAIN COMPONENT --------------------
const CitizenDashboardHome = ({ token }) => {
  const [chartData, setChartData] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);

  const [statsData, setStatsData] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [timeFrame, setTimeFrame] = useState("day");

  const [statusData, setStatusData] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // -------------------- FETCH SUMMARY --------------------
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get("https://nivaran-backend-zw9j.onrender.com/api/complaints/summary", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSummary(res.data);
      } catch (err) {
        console.error("Error fetching summary:", err);
      } finally {
        setLoadingSummary(false);
      }
    };
    if (token) fetchSummary();
  }, [token]);

  // -------------------- FETCH PENDING COMPLAINTS BY CATEGORY --------------------
  useEffect(() => {
    const fetchPendingComplaints = async () => {
      try {
        const res = await axios.get("https://nivaran-backend-zw9j.onrender.com/api/complaints/pending", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const counts = {};
        res.data.forEach((c) => {
          const rawType = c.complaintType?.trim();
          if (CATEGORY_MAP[rawType]) {
            const cat = CATEGORY_MAP[rawType];
            counts[cat] = (counts[cat] || 0) + 1;
          }
        });

        const chartArr = Object.entries(counts).map(([name, value], idx) => ({
          name,
          value,
          fill: COLORS[idx % COLORS.length],
        }));

        setChartData(chartArr);
      } catch (err) {
        console.error("Error fetching pending complaints:", err);
      } finally {
        setLoadingPending(false);
      }
    };

    if (token) fetchPendingComplaints();
  }, [token]);

  // -------------------- FETCH COMPLAINTS STATS (LINE CHART) --------------------
  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const endpoint =
          timeFrame === "day"
            ? "https://nivaran-backend-zw9j.onrender.com/api/complaints/stats/per-day"
            : "https://nivaran-backend-zw9j.onrender.com/api/complaints/stats/complaints-per-hour";

        const res = await axios.get(endpoint);
        setStatsData(res.data);
      } catch (err) {
        console.error("Error fetching complaints stats:", err);
        setStatsData([]);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [timeFrame]);

  // -------------------- FETCH STATUS DISTRIBUTION (PIE CHART) --------------------
  useEffect(() => {
    const fetchStatusDistribution = async () => {
      setLoadingStatus(true);
      try {
        const res = await axios.get("https://nivaran-backend-zw9j.onrender.com/api/complaints/status-count", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const mapped = res.data.map((c) => ({
          name: STATUS_MAP[c.name] || c.name,
          value: c.value,
        }));

        setStatusData(mapped);
      } catch (err) {
        console.error("Error fetching status data:", err);
      } finally {
        setLoadingStatus(false);
      }
    };

    if (token) fetchStatusDistribution();
  }, [token]);

  // -------------------- RENDER --------------------
  return (
    <div className="min-h-screen  w-full p-4  sm:p-6  md:p-8 lg:p-10 space-y-8 bg-gradient-to-br from-rose-50/50 via-white to-pink-50/50">
      <h2 className="text-2xl sm:text-3xl mt-[20px] md:text-4xl font-extrabold text-rose-600 mb-6 border-b-2 border-rose-200/50 pb-3 backdrop-blur-sm">
        Dashboard
      </h2>

      {/* -------------------- SUMMARY CARDS -------------------- */}
     <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {loadingSummary ? (
          <div className="col-span-full flex justify-center items-center h-32">
            <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : summary ? (
          Object.entries({
            "Total Authorities": summary.totalAuthorities,
            "Total Citizens": summary.totalCitizens,
            "Total Complaints": summary.totalTasks,
            "Pending Complaints": summary.statusCounts.pending,
          }).map(([label, value]) => (
            <div
              key={label}
              className="bg-rose-100/30 backdrop-blur-md shadow-lg rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center hover:shadow-xl hover:scale-105 transition-all duration-300 border border-rose-200/50"
            >
              <p className="text-gray-600 font-semibold text-xs sm:text-sm md:text-base">{label}</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-rose-600 mt-2">{value}</p>
            </div>
          ))
        ) : null}
      </div>

      {/* -------------------- PIE CHART -------------------- */}
      <div className="bg-rose-100/30 backdrop-blur-md shadow-lg rounded-2xl p-4 sm:p-6 border border-rose-200/50 hover:shadow-xl transition-all duration-300">
        <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-rose-700 mb-4 border-b border-rose-200/50 pb-2">
          Complaints by Status
        </h3>
        {loadingStatus ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : statusData.length === 0 ? (
          <p className="text-gray-600 text-sm sm:text-base">No complaints available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={100} label>
                {statusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "1px solid rgba(229, 231, 235, 0.5)",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* -------------------- BAR CHART -------------------- */}
      <div className="bg-rose-100/30 backdrop-blur-md shadow-lg rounded-2xl p-4 sm:p-6 border border-rose-200/50 hover:shadow-xl transition-all duration-300">
        <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-rose-700 mb-4 border-b border-rose-200/50 pb-2">
          Pending Complaints by Category
        </h3>
        {loadingPending ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : chartData.length === 0 ? (
          <p className="text-gray-600 text-sm sm:text-base">No pending complaints available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(229, 231, 235, 0.5)" />
              <XAxis dataKey="name" stroke="#4B5563" />
              <YAxis allowDecimals={false} stroke="#4B5563" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "1px solid rgba(229, 231, 235, 0.5)",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />
              <Bar dataKey="value" name="Pending Complaints" label={{ position: "top", fill: "#4B5563" }}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* -------------------- LINE CHART -------------------- */}
      <div className="bg-rose-100/30 backdrop-blur-md shadow-lg rounded-2xl p-4 sm:p-6 border border-rose-200/50 hover:shadow-xl transition-all duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-rose-700 border-b border-rose-200/50 pb-2 mb-2 sm:mb-0">
            Total Complaints Registered {timeFrame === "day" ? "Per Day" : "Per Hour"}
          </h3>
          <div className="flex gap-2">
            <button
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-all duration-300 ${
                timeFrame === "day"
                  ? "bg-rose-600 text-white shadow-md"
                  : "bg-rose-100/50 text-rose-600 hover:bg-rose-200/50"
              }`}
              onClick={() => setTimeFrame("day")}
            >
              Per Day
            </button>
            <button
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-all duration-300 ${
                timeFrame === "hour"
                  ? "bg-rose-600 text-white shadow-md"
                  : "bg-rose-100/50 text-rose-600 hover:bg-rose-200/50"
              }`}
              onClick={() => setTimeFrame("hour")}
            >
              Per Hour
            </button>
          </div>
        </div>

        <div className="relative">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={statsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(229, 231, 235, 0.5)" />
              <XAxis dataKey={timeFrame === "day" ? "date" : "hour"} stroke="#4B5563" />
              <YAxis allowDecimals={false} stroke="#4B5563" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "1px solid rgba(229, 231, 235, 0.5)",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#FF6384"
                strokeWidth={3}
                dot={{ r: 4, fill: "#FF6384" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>

          {loadingStats && (
            <div className="absolute inset-0 bg-rose-100/50 flex items-center justify-center rounded-xl">
              <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboardHome;
