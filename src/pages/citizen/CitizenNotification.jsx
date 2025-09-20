// src/components/Notifications.js
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const Notifications = ({ token, citizenId }) => {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Fetch existing notifications
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(res.data.reverse()); // newest first
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();

    // Connect to Socket.IO
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    // Join user-specific room
    if (citizenId) newSocket.emit("join", citizenId);

    // Listen for new notifications
    const handleNewNotification = (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    };
    newSocket.on("newNotification", handleNewNotification);

    // Cleanup on unmount
    return () => {
      newSocket.off("newNotification", handleNewNotification);
      newSocket.disconnect();
    };
  }, [token, citizenId]);

  // Mark notification as read
  const markAsRead = async (notifId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/notifications/${notifId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notifId ? { ...n, read: true } : n
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li
              key={n._id}
              className={`p-2 border rounded flex flex-col ${
                n.read ? "bg-gray-100" : "bg-rose-50"
              } cursor-pointer`}
              onClick={() => !n.read && markAsRead(n._id)}
            >
              <span>{n.message}</span>
              <span className="text-xs text-gray-500 mt-1">
                {new Date(n.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
