const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const app = express.Router();
const zod = require('zod');
const { JWT_SECRET } = require('../config');
const { User, Room } = require('../db');

// Validation schemas
const signupBody = zod.object({
  username: zod.string().min(3).max(20),
  email: zod.string().email(),
  password: zod.string().min(6).max(20),
});

const signinBody = zod.object({
  email: zod.string().email(),
  password: zod.string().min(6).max(20),
});

// Signup Route
app.post("/signup", async (req, res) => {
  const success = signupBody.safeParse(req.body);
  if (!success.success) {
    return res.status(400).json({ errors: success.error.errors });
  }

  const { username, email, password } = req.body;

  // Check if the user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).send("User already exists");
  }

  // Hash the password before saving it
  const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

  // Create the user with the hashed password
  const user = await User.create({
    username,
    email,
    password: hashedPassword, // Store the hashed password
  });

  // Generate JWT token
  const token = jwt.sign({ userId: user._id }, JWT_SECRET);

  res.json({
    message: "User Created",
    token,
    username: user.username,
  });
});

// Signin Route
app.post("/signin", async (req, res) => {
  const success = signinBody.safeParse(req.body);
  if (!success.success) {
    return res.status(400).json({ errors: success.error.errors });
  }

  const { email, password } = req.body;

  // Step 1: Find the user by email
  const user = await User.findOne({ email });

  // Step 2: Prioritize "User not found" error
  if (!user) {
    return res.status(400).send("User not found");
  }

  // Step 3: Verify the password using bcrypt
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).send("Invalid password");
  }

  // Step 4: Generate JWT token if credentials are valid
  const token = jwt.sign({ userId: user._id }, JWT_SECRET);

  res.json({
    message: "User Logged In",
    token,
    username: user.username,
  });
});

module.exports = app;