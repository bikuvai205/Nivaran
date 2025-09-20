// src/components/Notifications.js
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const Notifications = ({ token, citizenId }) => {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // fetch existing notifications
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotifications();

    // connect socket
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    // join user-specific room
    newSocket.emit("join", citizenId);

    // listen for new notifications
    newSocket.on("newNotification", (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    });

    return () => newSocket.disconnect();
  }, [token, citizenId]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n, index) => (
            <li key={index} className="p-2 border rounded bg-rose-50">
              {n.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
