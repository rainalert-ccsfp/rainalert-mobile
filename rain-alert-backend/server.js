require("dotenv").config(); // Make sure .env is loaded

const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const { Expo } = require("expo-server-sdk");

const app = express();
const port = process.env.PORT || 5000;

const expo = new Expo();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ✅ Use connection pool instead of single connection
const db = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306
});

db.query("SELECT 1", (err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.stack);
  } else {
    console.log("✅ Connected to MySQL database successfully.");
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

// Register
app.post("/register", (req, res) => {
  const { full_name, email, password } = req.body;
  
  console.log("Registration attempt for:", email);
  
  // Validate input
  if (!full_name || !email || !password) {
    console.log("Registration failed: Missing required fields");
    return res.status(400).json({ message: "All fields are required." });
  }

  const sql =
    "INSERT INTO mob_app_users (full_name, email, password, phone_number, login_method, status, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
  const values = [
    full_name,
    email,
    password,
    "0000000000",
    "email",
    "active",
    "user",
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        console.log("Registration failed: Email already exists -", email);
        return res.status(400).json({ message: "Email already exists." });
      }
      console.error("Database error during registration:", err);
      return res.status(500).json({ message: "Database error occurred." });
    }
    console.log("Registration successful for:", email);
    res.status(200).json({ message: "User registered successfully" });
  });
});

// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  
  console.log("Login attempt for:", email);
  
  // Validate input
  if (!email || !password) {
    console.log("Login failed: Missing email or password");
    return res.status(400).json({ message: "Email and password are required." });
  }

  const sql = "SELECT * FROM mob_app_users WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error("Database error during login:", err);
      return res.status(500).json({ message: "Database error occurred." });
    }
    
    if (results.length === 0) {
      console.log("Login failed: Invalid credentials for", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = results[0];
    console.log("Login successful for:", email);
    return res
      .status(200)
      .json({ 
        message: "Login successful", 
        user: {
          id: user.user_id,
          full_name: user.full_name,
          email: user.email,
          phone_number: user.phone_number,
          login_method: user.login_method,
          status: user.status,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      });
  });
});

// Forgot Password
app.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  
  console.log("Forgot password request for:", email);
  
  // Validate input
  if (!email) {
    console.log("Forgot password failed: Missing email");
    return res.status(400).json({ message: "Email is required." });
  }

  const sql = "SELECT * FROM mob_app_users WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("Database error during forgot password:", err);
      return res.status(500).json({ message: "Database error occurred." });
    }
    
    if (results.length === 0) {
      console.log("Forgot password failed: Email not found -", email);
      return res.status(404).json({ message: "Email not found" });
    }

    console.log("Forgot password successful for:", email);
    return res.status(200).json({ message: "Email found" });
  });
});

// Reset Password
app.post("/reset-password", (req, res) => {
  const { email, newPassword } = req.body;
  
  console.log("Reset password request for:", email);
  
  // Validate input
  if (!email || !newPassword) {
    console.log("Reset password failed: Missing email or new password");
    return res.status(400).json({ message: "Email and new password are required." });
  }

  const sql =
    "UPDATE mob_app_users SET password = ?, updated_at = NOW() WHERE email = ?";
  db.query(sql, [newPassword, email], (err, result) => {
    if (err) {
      console.error("Database error during reset password:", err);
      return res.status(500).json({ message: "Database error occurred." });
    }
    
    if (result.affectedRows === 0) {
      console.log("Reset password failed: User not found -", email);
      return res.status(404).json({ message: "User not found" });
    }
    
    console.log("Reset password successful for:", email);
    return res.status(200).json({ message: "Password reset successfully" });
  });
});

// Get all flood records
app.get("/flood-records", (req, res) => {
  console.log("Fetching all flood records");

  // The schema is: id, year, month, barangay, flood_depth_m, duration_hours, cause
  const sql = "SELECT * FROM flood_records ORDER BY `year` DESC, FIELD(`month`, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December') DESC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database error fetching flood records:", err);
      return res.status(500).json({ message: "Database error occurred." });
    }
    console.log(`Successfully fetched ${results.length} flood records.`);
    res.status(200).json(results);
  });
});

// Get a simulated flood prediction
app.get("/flood-prediction", (req, res) => {
  console.log("Generating simulated flood prediction");

  const currentMonth = new Date().getMonth() + 1; // 1-12
  let predictedLevel = "caution";
  let confidence = 0.7;

  // Simulate seasonal variation for the Philippines
  if (currentMonth >= 6 && currentMonth <= 10) { // Wet season (June - October)
    predictedLevel = "severe";
    confidence = 0.85 + Math.random() * 0.1; // 0.85 - 0.95
  } else if (currentMonth >= 11 || currentMonth <= 2) { // Cooler, transitional months
    predictedLevel = "moderate";
    confidence = 0.75 + Math.random() * 0.1; // 0.75 - 0.85
  } else { // Hot, dry season (March - May)
    predictedLevel = "caution";
    confidence = 0.65 + Math.random() * 0.1; // 0.65 - 0.75
  }

  const prediction = {
    predictedLevel,
    confidence: Math.min(0.95, confidence), // Cap confidence at 0.95
    timestamp: new Date().toISOString(),
  };

  console.log(`Prediction for month ${currentMonth}: ${prediction.predictedLevel} with ${prediction.confidence.toFixed(2)} confidence`);
  res.status(200).json(prediction);
});

// Create a new flood report
app.post("/reports", (req, res) => {
  const { latitude, longitude, address, level, description } = req.body;
  console.log("Creating new flood report:", { latitude, longitude, level });

  if (!latitude || !longitude || !level) {
    return res.status(400).json({ message: "Latitude, longitude, and level are required." });
  }

  const sql = "INSERT INTO user_flood_reports (latitude, longitude, address, level, description) VALUES (?, ?, ?, ?, ?)";
  const values = [latitude, longitude, address, level, description];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Database error creating flood report:", err);
      return res.status(500).json({ message: "Database error occurred." });
    }
    console.log("Successfully created new flood report with ID:", result.insertId);
    res.status(201).json({ message: "Report created successfully", reportId: result.insertId });
  });
});

// Get all user-submitted flood reports
app.get("/reports", (req, res) => {
  console.log("Fetching all user-submitted flood reports");

  const sql = "SELECT * FROM user_flood_reports ORDER BY reported_at DESC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database error fetching flood reports:", err);
      return res.status(500).json({ message: "Database error occurred." });
    }
    console.log(`Successfully fetched ${results.length} user flood reports.`);
    res.status(200).json(results);
  });
});

// Save or update Expo push token for a user
app.post("/api/mob_app_users/save-token", (req, res) => {
  const { userId, token } = req.body;
  if (!userId || !token) {
    return res.status(400).json({ message: "userId and token are required." });
  }
  const sql = "UPDATE mob_app_users SET expo_push_token = ? WHERE user_id = ?";
  db.query(sql, [token, userId], (err, result) => {
    if (err) {
      console.error("Error saving push token:", err);
      return res.status(500).json({ message: "Database error." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }
    console.log(`Saved push token for user ${userId}`);
    res.status(200).json({ message: "Token saved successfully." });
  });
});

// Send push notification to selected users
app.post("/api/send-push-alert", async (req, res) => {
  const { userIds, message } = req.body;
  console.log("Attempting to send push notification:", { userIds, message });

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0 || !message) {
    console.log("Invalid request data:", { userIds, message });
    return res.status(400).json({ message: "userIds (array) and message are required." });
  }

  // Get tokens for users
  const sql = `SELECT expo_push_token FROM mob_app_users WHERE user_id IN (?) AND expo_push_token IS NOT NULL`;
  db.query(sql, [userIds], async (err, results) => {
    if (err) {
      console.error("Error fetching push tokens:", err);
      return res.status(500).json({ message: "Database error." });
    }

    console.log("Database query results:", results);
    
    const tokens = results.map(r => r.expo_push_token).filter(Boolean);
    console.log("Found push tokens:", tokens);

    if (tokens.length === 0) {
      console.log("No push tokens found for users:", userIds);
      return res.status(404).json({ message: "No push tokens found for selected users." });
    }

    // Prepare Expo messages
    const messages = tokens.map(token => ({
      to: token,
      sound: "default",
      title: "RainAlert Notification",
      body: message,
      data: { _body: message, timestamp: new Date().toISOString(), level: message },
    }));

    console.log("Preparing to send messages:", messages);

    try {
      let chunks = expo.chunkPushNotifications(messages);
      let tickets = [];
      for (let chunk of chunks) {
        console.log("Sending chunk to Expo:", chunk);
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log("Expo response:", ticketChunk);
        tickets.push(...ticketChunk);
      }
      console.log("Successfully sent notifications. Tickets:", tickets);
      res.status(200).json({ message: "Push notifications sent.", tickets });
    } catch (error) {
      console.error("Error sending push notifications:", error);
      res.status(500).json({ message: "Failed to send push notifications." });
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  console.log('404 - Route not found:', req.method, req.path);
  res.status(404).json({ message: 'Route not found' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`🌐 Server also accessible at http://0.0.0.0:${port}`);
});
