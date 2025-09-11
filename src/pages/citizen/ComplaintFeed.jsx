// src/pages/citizen/ComplaintFeed.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { ArrowUp, ArrowDown, MapPin } from "lucide-react";

const ComplaintFeed = ({ citizen, token }) => {
  const [complaints, setComplaints] = useState([]);

  // Fetch pending complaints
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/complaints/pending", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const mapped = res.data.map((c) => {
          const myVote =
            c.votes?.find((v) => v.user === citizen?._id)?.voteType || 0;

          return {
            id: c._id,
            user: c.anonymous ? "Anonymous" : c.user.fullName,
            time: new Date(c.createdAt).toLocaleString(),
            title: c.title,
            content: c.description,
            location: c.location || "N/A",
            complaintType: c.complaintType,
            severity: c.severity,
            upvotes: c.upvotes,
            downvotes: c.downvotes,
            userVote: myVote,
            image: c.image
              ? `http://localhost:5000/uploads/complaints/${c.image}`
              : null,
          };
        });

        setComplaints(mapped);
      } catch (err) {
        console.error("Fetch complaints error:", err);
      }
    };

    if (citizen?._id) fetchComplaints();
  }, [citizen?._id, token]);

  // Handle upvote/downvote
const handleVote = async (id, voteType) => {
  try {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;

        let newVote = voteType;
        let up = c.upvotes;
        let down = c.downvotes;

        // If clicking same vote again, toggle off
        if (c.userVote === voteType) {
          newVote = 0;
          if (voteType === 1) up--;
          if (voteType === -1) down--;
        } else {
          // Remove previous vote if exists
          if (c.userVote === 1) up--;
          if (c.userVote === -1) down--;

          if (voteType === 1) up++;
          if (voteType === -1) down++;
        }

        return { ...c, upvotes: up, downvotes: down, userVote: newVote };
      })
    );

    // Determine voteType to send to backend (0 if removing vote)
    const currentComplaint = complaints.find((c) => c.id === id);
    const sendVote = currentComplaint.userVote === voteType ? 0 : voteType;

    const res = await axios.put(
      `http://localhost:5000/api/complaints/${id}/vote`,
      { voteType: sendVote },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Sync counts and userVote with backend
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, upvotes: res.data.upvotes, downvotes: res.data.downvotes, userVote: sendVote }
          : c
      )
    );
  } catch (err) {
    console.error("Vote error:", err);
  }
};


  return (
    <div className="p-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      <h2 className="text-2xl font-bold text-rose-600 mb-6">Complaint Feed</h2>
      <div className="space-y-6">
        {complaints.map((complaint) => (
          <div
            key={complaint.id}
            className="bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="px-6 pt-4">
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-blue-800">{complaint.user}</span>
                <div className="flex flex-col items-end text-sm text-gray-500">
                  <span>{complaint.time}</span>
                  {complaint.location && (
                    <div className="flex items-center mt-1">
                      <MapPin size={16} className="mr-1 text-rose-500 flex-shrink-0" />
                      <span className="text-gray-700">{complaint.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-1">{complaint.title}</h3>
              <p className="text-sm text-rose-600 font-semibold mb-2">{complaint.complaintType}</p>
              <hr className="border-gray-300 border-[1.2px] mb-3" />
            </div>

            <div className="px-6 pb-4">
              <p className="text-gray-700 mb-4">{complaint.content}</p>
              {complaint.image && (
                <div className="flex justify-center bg-gray-50 rounded-xl overflow-hidden">
                  <img
                    src={complaint.image}
                    alt="Complaint"
                    className="max-h-[500px] w-auto object-contain"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center space-x-6 px-6 py-3 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleVote(complaint.id, 1)}
                  className={`transition-colors ${complaint.userVote === 1 ? "text-blue-600" : "text-gray-400 hover:text-blue-600"}`}
                >
                  <ArrowUp size={26} strokeWidth={5} fill={complaint.userVote === 1 ? "currentColor" : "none"} />
                </button>
                <span className="font-semibold text-gray-700">{complaint.upvotes}</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleVote(complaint.id, -1)}
                  className={`transition-colors ${complaint.userVote === -1 ? "text-red-600" : "text-gray-400 hover:text-red-600"}`}
                >
                  <ArrowDown size={26} strokeWidth={5} fill={complaint.userVote === -1 ? "currentColor" : "none"} />
                </button>
                <span className="font-semibold text-gray-700">{complaint.downvotes}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComplaintFeed;
