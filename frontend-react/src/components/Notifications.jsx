// src/components/Notifications.jsx
import React, { useState, useEffect } from "react";
import "../styles/Notifications.css";

import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../services/api-enhanced";

import { getSocket } from "../services/socket";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchNotifications();

    const socket = getSocket();

    // Socket may be null on first render — skip binding
    if (!socket) {
      console.warn("Notifications: socket not ready yet");
      return;
    }

    const handler = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      if (Notification.permission === "granted") {
        new Notification("New Notification", {
          body: notification.message,
          icon: "/logo192.png",
        });
      }
    };

    socket.on("notification:new", handler);

    return () => {
      socket.off("notification:new", handler);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("Error marking read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "task_created":
        return "➕";
      case "task_updated":
        return "✏️";
      case "task_deleted":
        return "🗑️";
      case "task_completed":
        return "✅";
      default:
        return "🔔";
    }
  };

  return (
    <div className="notifications-wrapper">
      <button
        className="notification-bell"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>

      {showDropdown && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead} className="mark-all-btn">
                Mark all as read
              </button>
            )}
          </div>

          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">No notifications</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`notification-item ${notif.read ? "read" : "unread"}`}
                  onClick={() => !notif.read && handleMarkAsRead(notif._id)}
                >
                  <div className="notification-icon">{getIcon(notif.type)}</div>
                  <div className="notification-content">
                    <p className="notification-message">{notif.message}</p>
                    <span className="notification-time">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {!notif.read && <div className="unread-dot"></div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
// src/components/Notifications.jsx