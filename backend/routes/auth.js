import express from "express";
import db from "../db.js"; // Pulls in your database connection

const router = express.Router();

router.post("/login", async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  // 1. Make sure they didn't send blank fields
  if (!usernameOrEmail || !password) {
    return res.status(400).json({ error: "Please provide both username/email and password." });
  }

  try {
    // 2. Query your actual database!
    // CHANGE 'users' to your actual table name if it is different
    const [rows] = await db.query(
      "SELECT * FROM Users WHERE (email = ? OR username = ?) AND password = ?", 
      [usernameOrEmail, usernameOrEmail, password]
    );

    // 3. Check if the query found a matching user
    if (rows.length > 0) {
      // Success! Send back the approval
      return res.json({ success: true, message: "Login successful!" });
    } else {
      // Failure! Send back the error
      return res.status(401).json({ error: "Invalid username or password." });
    }
  } catch (error) {
    console.error("Login database error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

export default router;