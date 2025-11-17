// src/App.js
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import Dashboard from "./pages/DashboardEnhanced";
import ProtectedRoute from "./components/ProtectedRoute";

import { initializeSocket, disconnectSocket } from "./services/socket";

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem("user", JSON.stringify(loggedInUser));

    // 🔥 IMPORTANT: initialize socket right after login
    initializeSocket();
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");

    disconnectSocket();

    fetch("http://localhost:5000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  };

  return (
    <Router>
      <div style={{ padding: "20px" }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />

          <Route path="/signup" element={<SignupForm />} />

          <Route path="/login" element={<LoginForm setUser={handleLogin} />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user}>
                <Dashboard user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<h2>404 - Page Not Found</h2>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
