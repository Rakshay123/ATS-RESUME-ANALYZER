const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "smart-resume-fallback-secret";

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(`Register attempt for: ${email}`);
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashedPassword });
    
    // Check DB connection before saving
    if (mongoose.connection.readyState !== 1) {
      console.error("❌ Registration failed: Database not connected");
      return res.status(503).json({ message: "Database is currently offline. Please try again in 1 minute." });
    }

    await user.save();
    console.log(`✅ Registration successful for: ${email}`);

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user: { id: user._id, name, email } });
  } catch (err) {
    console.error("❌ Registration Error:", err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error during registration" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`Login failed: User not found (${email})`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
    console.log(`Login successful for: ${email}`);
    res.json({ token, user: { id: user._id, name: user.name, email } });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
