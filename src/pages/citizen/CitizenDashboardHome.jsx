// src/pages/citizen/CitizenDashboardHome.jsx
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
} from "recharts";

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

const COLORS = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#8AFF33",
  "#FF8A33",
  "#33FFD5",
  "#9B33FF",
];

const CitizenDashboardHome = ({ token }) => {
  const [chartData, setChartData] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);

  const [statsData, setStatsData] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [timeFrame, setTimeFrame] = useState("day"); // 'day' or 'hour'

  // Fetch pending complaints
  useEffect(() => {
    const fetchPendingComplaints = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/complaints/pending",
          { headers: { Authorization: `Bearer ${token}` } }
        );

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

  // Fetch total complaints stats (per day / per hour)
  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const endpoint =
          timeFrame === "day"
            ? "http://localhost:5000/api/complaints/stats/per-day"
            : "http://localhost:5000/api/complaints/stats/complaints-per-hour";

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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-rose-600 mb-4">Dashboard</h2>

      {/* Pending Complaints Bar Chart */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Pending Complaints by Category</h3>
        {loadingPending ? (
          <p className="text-gray-500">Loading chart...</p>
        ) : chartData.length === 0 ? (
          <p className="text-gray-500">No pending complaints available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="value"
                name="Total number of Pending Complaints of each category"
                label={{ position: "top" }}
              >
                {chartData.map((entry, index) => (
                  <cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Toggle Buttons for Line Chart */}
      <div className="mb-4 flex gap-2">
        <button
          className={`px-4 py-2 rounded ${
            timeFrame === "day" ? "bg-rose-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setTimeFrame("day")}
        >
          Per Day
        </button>
        <button
          className={`px-4 py-2 rounded ${
            timeFrame === "hour" ? "bg-rose-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setTimeFrame("hour")}
        >
          Per Hour
        </button>
      </div>

      {/* Total Complaints Line Chart */}
      <div>
        <h3 className="text-xl font-semibold mb-2">
          Total Complaints Registered {timeFrame === "day" ? "Per Day" : "Per Hour"}
        </h3>
        {loadingStats ? (
          <p className="text-gray-500">Loading chart...</p>
        ) : statsData.length === 0 ? (
          <p className="text-gray-500">No complaints registered yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={statsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={timeFrame === "day" ? "date" : "hour"} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#FF6384" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default CitizenDashboardHome;
