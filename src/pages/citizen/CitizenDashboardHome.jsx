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
} from "recharts";

const CATEGORY_MAP = {
  "Roads": "Infrastructural Development",
  "Maintenance": "Infrastructural Development",
  "Infrastructure": "Infrastructural Development",
  "Garbage/Waste/Pollution": "Pollution",
  "Traffic": "Pollution",
  "Water": "Drinking Water",
  "Electricity": "Electricity",
  "Street Animal": "Street Animal",
  "Environment": "Environment",
  "Others": "Others",
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingComplaints = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/complaints/pending", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Count complaints per grouped category
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
        setLoading(false);
      }
    };

    if (token) fetchPendingComplaints();
  }, [token]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-rose-600 mb-4">
        Pending Complaints by Category
      </h2>

      {loading ? (
        <p className="text-gray-500">Loading chart...</p>
      ) : chartData.length === 0 ? (
        <p className="text-gray-500">No pending complaints available.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="value"
              name="Pending Complaints"
              fill="#8884d8"
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
  );
};

export default CitizenDashboardHome;
