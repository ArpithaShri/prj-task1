// src/pages/DashboardEnhanced.jsx
import React, { useEffect, useState } from "react";
import { initializeSocket, disconnectSocket, getSocket } from "../services/socket";

import Chat from "../components/Chat";
import Notifications from "../components/Notifications";
import GraphQLTasks from "../components/GraphQLTasks";

import "../styles/Dashboard.css";

export default function DashboardEnhanced({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("graphql");
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    // Initialize socket ONCE
    const socket = initializeSocket();

    if (!socket) {
      console.warn("Dashboard: socket not yet initialized");
      return;
    }

    // Set connection listeners
    socket.on("connect", () => {
      setSocketConnected(true);
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    // Notification permissions
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Cleanup
    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  const handleLogout = () => {
    disconnectSocket();
    onLogout();
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-left">
          <h1>Task Manager Pro</h1>

          <span className={`connection-status ${socketConnected ? "connected" : "disconnected"}`}>
            {socketConnected ? "Connected" : "Disconnected"}
          </span>
        </div>

        <div className="nav-right">
          <Notifications />
          <div className="user-info">
            <span>{user?.username}</span>
            <span className="user-role">{user?.role}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "graphql" ? "active" : ""}`}
            onClick={() => setActiveTab("graphql")}
          >
            GraphQL Tasks
          </button>

          <button
            className={`tab ${activeTab === "chat" ? "active" : ""}`}
            onClick={() => setActiveTab("chat")}
          >
            Live Chat
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "graphql" && <GraphQLTasks />}
          {activeTab === "chat" && <Chat user={user} />}
        </div>
      </div>

      <footer className="dashboard-footer">
        <div className="tech-stack">
          <span>Tech Stack:</span>
          <span className="tech-badge">MongoDB</span>
          <span className="tech-badge">Express</span>
          <span className="tech-badge">React</span>
          <span className="tech-badge">Node.js</span>
          <span className="tech-badge">Socket.io</span>
          <span className="tech-badge">GraphQL</span>
        </div>
      </footer>
    </div>
  );
}
