// src/components/SignupForm.jsx
import React, { useState } from "react";
import { signup } from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function SignupForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // optional role select
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!username.trim() || !password.trim()) {
      setErrorMsg("Please provide username and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await signup({ username: username.trim(), password, role });
      // backend typically returns { message: "User registered successfully" }
      if (res && (res.message || res.success)) {
        // redirect to login with a small success message
        navigate("/login", { state: { signupSuccess: true } });
      } else {
        throw new Error(res?.message || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setErrorMsg(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    minHeight: "80vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg,#2563eb 0%, #5b21b6 100%)",
    padding: "40px",
  };

  const cardStyle = {
    width: "420px",
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

  return (
    <div style={containerStyle}>
      <form style={cardStyle} onSubmit={handleSignup} aria-label="Signup form">
        <h2 style={{ textAlign: "center", marginBottom: 8 }}>Create Account</h2>
        <p style={{ textAlign: "center", marginTop: 0, color: "rgba(255,255,255,0.85)" }}>
          Sign up to start using the Task Manager
        </p>

        {errorMsg && (
          <div
            role="alert"
            style={{
              background: "rgba(255,0,0,0.12)",
              color: "#fff",
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
          placeholder="Choose a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          aria-label="username"
          autoComplete="username"
        />

        <label style={{ fontSize: 13, opacity: 0.9 }}>Password</label>
        <input
          style={inputStyle}
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-label="password"
          autoComplete="new-password"
        />

        <label style={{ fontSize: 13, opacity: 0.9 }}>Role (optional)</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{
            ...inputStyle,
            padding: "10px",
            background: "rgba(255,255,255,0.08)",
            appearance: "none",
          }}
          aria-label="role"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <button style={btnStyle} type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Create account"}
        </button>

        <div style={{ marginTop: 12, textAlign: "center", fontSize: 14 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#ffd166", textDecoration: "underline" }}>
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
