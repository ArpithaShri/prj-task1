// src/components/LoginForm.jsx
import React, { useState } from "react";
import { login } from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!username.trim() || !password.trim()) {
      setErrorMsg("Please enter both username and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await login({ username: username.trim(), password });
      // backend returns { message, user }
      const user = res?.user || null;
      if (!user) {
        // some servers respond differently; try to extract
        throw new Error(res?.message || "Login failed");
      }

      // Persist user locally (so ProtectedRoute can check)
      if (onLogin) onLogin(user);
      localStorage.setItem("user", JSON.stringify(user));

      // navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Simple, clean glass-card UI
  const containerStyle = {
    minHeight: "80vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg,#5b21b6 0%, #2563eb 100%)",
    padding: "40px",
  };

  const cardStyle = {
    width: "380px",
    padding: "36px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.07)",
    boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
    color: "white",
    backdropFilter: "blur(6px)",
    border: "1px solid rgba(255,255,255,0.06)",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    margin: "8px 0 14px",
    borderRadius: "8px",
    border: "none",
    outline: "none",
    background: "rgba(255,255,255,0.12)",
    color: "white",
    fontSize: "15px",
  };

  const btnStyle = {
    width: "100%",
    padding: "12px 16px",
    marginTop: "6px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    background: "#ffffff",
    color: "#2563eb",
    fontWeight: 700,
    fontSize: "16px",
  };

  const smallLink = { color: "#ffd166", textDecoration: "underline" };

  return (
    <div style={containerStyle}>
      <form style={cardStyle} onSubmit={handleSubmit} aria-label="Login form">
        <h2 style={{ textAlign: "center", marginBottom: 8 }}>Welcome Back</h2>
        <p style={{ textAlign: "center", marginTop: 0, color: "rgba(255,255,255,0.85)" }}>
          Sign in to continue
        </p>

        {errorMsg && (
          <div
            role="alert"
            style={{
              background: "rgba(255,0,0,0.12)",
              color: "#ffefef",
              padding: "8px 12px",
              borderRadius: 8,
              marginTop: 12,
              marginBottom: 6,
              fontSize: 14,
            }}
          >
            {errorMsg}
          </div>
        )}

        <label style={{ fontSize: 13, opacity: 0.9 }}>Username</label>
        <input
          style={inputStyle}
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          aria-label="username"
          autoComplete="username"
        />

        <label style={{ fontSize: 13, opacity: 0.9 }}>Password</label>
        <input
          style={inputStyle}
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-label="password"
          autoComplete="current-password"
        />

        <button style={btnStyle} type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>

        <div style={{ marginTop: 12, textAlign: "center", fontSize: 14 }}>
          Don't have an account?{" "}
          <Link to="/signup" style={smallLink}>
            Create one
          </Link>
        </div>
      </form>
    </div>
  );
}
