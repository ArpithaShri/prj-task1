import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// ✅ SIGNUP ROUTE
router.post("/signup", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      username,
      password: hashedPassword,
      role: role || "user",
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("❌ Signup failed:", err.message);
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
});

// ✅ LOGIN ROUTE
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Send token as HTTP-only cookie
    res.cookie("token", token, { httpOnly: true, secure: false });
    res.json({ message: "Login successful", user: { username: user.username, role: user.role } });
  } catch (err) {
    console.error("❌ Login failed:", err.message);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

// ✅ LOGOUT ROUTE
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

export default router;
// backend/routes/authRoutes.js