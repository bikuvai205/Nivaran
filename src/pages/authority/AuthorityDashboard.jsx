import React from "react";
import { Bell, LogOut, User } from "lucide-react";

export default function AuthorityDashboard() {
  // 🔧 Sample authority + complaints data
  const authority = {
    name: "Police Unit – Ward 12",
    email: "ward12police@gmail.com",
  };

  const stats = [
    { title: "Total Complaints", value: 120, color: "bg-blue-500" },
    { title: "Pending", value: 45, color: "bg-yellow-500" },
    { title: "In Progress", value: 30, color: "bg-orange-500" },
    { title: "Resolved", value: 45, color: "bg-green-500" },
  ];

  const complaints = [
    {
      id: "C-1021",
      title: "Street light not working",
      citizen: "Ramesh Thapa",
      status: "Pending",
      date: "2025-08-28",
    },
    {
      id: "C-1022",
      title: "Noise disturbance",
      citizen: "Sita Shrestha",
      status: "In Progress",
      date: "2025-08-29",
    },
    {
      id: "C-1023",
      title: "Illegal parking",
      citizen: "Hari KC",
      status: "Resolved",
      date: "2025-09-01",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 🔝 Navbar */}
      <header className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{authority.name}</h1>
          <p className="text-sm text-gray-500">{authority.email}</p>
        </div>
        <div className="flex gap-4 items-center">
          <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
            <Bell className="w-5 h-5 text-gray-700" />
          </button>
          <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
            <User className="w-5 h-5 text-gray-700" />
          </button>
          <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full flex gap-2 items-center">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* 📊 Stats Section */}
      <main className="flex-1 px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((s, i) => (
            <div
              key={i}
              className={`rounded-2xl shadow-md p-6 text-white font-bold ${s.color}`}
            >
              <h2 className="text-lg">{s.title}</h2>
              <p className="text-3xl mt-2">{s.value}</p>
            </div>
          ))}
        </div>

        {/* 📋 Complaints Table */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Complaints
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Citizen</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4">{c.id}</td>
                    <td className="py-3 px-4">{c.title}</td>
                    <td className="py-3 px-4">{c.citizen}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          c.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : c.status === "In Progress"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{c.date}</td>
                    <td className="py-3 px-4">
                      <button className="px-3 py-1 rounded-full bg-blue-500 text-white text-sm hover:bg-blue-600">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
