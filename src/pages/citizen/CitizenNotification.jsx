import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Clock, AlertTriangle, Shield, Loader2, X as CloseIcon } from "lucide-react";

const Notifications = ({ token, citizenId, socket }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications from DB
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(res.data);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchNotifications();
  }, [token]);

  // Listen for live notifications
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    };

    socket.on("newNotification", handleNewNotification);
    return () => socket.off("newNotification", handleNewNotification);
  }, [socket]);

  // Mark as read
  const markAsRead = async (notifId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/notifications/${notifId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // Delete notification
  const deleteNotification = async (notifId) => {
    try {
      await axios.delete(`http://localhost:5000/api/notifications/${notifId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n._id !== notifId));
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const getNotificationStyle = (type) => {
    switch (type) {
      case "submitted":
        return { bg: "bg-green-100/30", icon: <CheckCircle className="h-5 w-5 text-green-500" />, color: "text-green-700" };
      case "assigned":
        return { bg: "bg-blue-100/30", icon: <Shield className="h-5 w-5 text-blue-500" />, color: "text-blue-700" };
      case "rejected":
        return { bg: "bg-red-100/30", icon: <AlertTriangle className="h-5 w-5 text-red-500" />, color: "text-red-700" };
      case "inprogress":
        return { bg: "bg-amber-100/30", icon: <Clock className="h-5 w-5 text-amber-500" />, color: "text-amber-700" };
      case "resolved":
        return { bg: "bg-emerald-100/30", icon: <CheckCircle className="h-5 w-5 text-emerald-500" />, color: "text-emerald-700" };
      default:
        return { bg: "bg-gray-100/30", icon: <Shield className="h-5 w-5 text-gray-500" />, color: "text-gray-700" };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin text-rose-500" size={24} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-10 bg-gradient-to-br from-rose-50/50 via-white to-pink-50/50 space-y-8">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-rose-600 mb-6 border-b-2 border-rose-200/50 pb-3 backdrop-blur-sm">
        Notifications
      </h2>

      {notifications.length === 0 ? (
        <div className="text-center text-rose-600 py-12 bg-rose-100/30 backdrop-blur-md shadow-lg rounded-2xl border border-rose-200/50">
          <Shield className="mx-auto mb-4 text-6xl opacity-50" />
          <p className="text-lg font-medium">No notifications yet.</p>
          <p className="text-sm text-rose-500">You'll be notified when there are updates on your complaints.</p>
        </div>
      ) : (
        <ul className="space-y-4 max-w-3xl mx-auto">
          <AnimatePresence>
            {notifications.map((n) => {
              const { bg, icon, color } = getNotificationStyle(n.type);
              return (
                <motion.li
                  key={n._id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 200, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className={`p-4 rounded-2xl border border-rose-200/50 backdrop-blur-md shadow-md cursor-pointer hover:shadow-xl flex justify-between items-start transition-transform duration-150 ${n.read ? "bg-rose-100/30" : `${bg} border-l-4 border-rose-500`}`}
                >
                  <div className="flex items-start gap-3 flex-1" onClick={() => !n.read && markAsRead(n._id)}>
                    {icon}
                    <div>
                      <p className={`font-medium ${color}`}>{n.message}</p>
                      <p className="text-xs text-rose-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent parent click
                      deleteNotification(n._id);
                    }}
                    className="text-rose-500 hover:text-rose-700 p-1 rounded-full cursor-pointer transition-colors"
                  >
                    <CloseIcon className="h-5 w-5" />
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
};

export default Notifications;
