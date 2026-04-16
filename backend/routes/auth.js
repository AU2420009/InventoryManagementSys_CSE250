import express from "express";
import db from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"; 
import nodemailer from "nodemailer"; // ✅ Added for sending emails

const router = express.Router();

// ---------------------------------------------------------
// 1. LOGIN ROUTE
// ---------------------------------------------------------
router.post("/login", async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail || !password) {
    return res.status(400).json({
      error: "Please provide both username/email and password."
    });
  }

  try {
    console.log(`\n--- [LOGIN ATTEMPT] User: ${usernameOrEmail} ---`);
    
    // Fetch from DB without destructuring immediately
    const queryResult = await db.query(
      "SELECT * FROM Users WHERE email = ? OR username = ?",
      [usernameOrEmail, usernameOrEmail]
    );
    
    // Safely extract the rows (Handles both mysql and mysql2 automatically)
    let rows = [];
    if (Array.isArray(queryResult) && Array.isArray(queryResult[0])) {
        rows = queryResult[0]; 
    } else if (Array.isArray(queryResult)) {
        rows = queryResult; 
    }

    // Check if user was found
    if (rows.length === 0) {
      console.log("❌ [LOGIN FAILED] No user found in database.");
      return res.status(401).json({ error: "User not found." });
    }

    const user = rows[0];
    
    // Protect against missing columns
    if (user.password_hash === undefined) {
       console.log("⚠️ [ERROR] 'password_hash' column is missing from the database result!");
       return res.status(500).json({ error: "Database schema error." });
    }

    // Your clever hybrid password check
    const stored = String(user.password_hash).trim();
    const entered = String(password).trim();

    const isMatch =
      stored.startsWith("$2") && stored.length > 50
        ? await bcrypt.compare(entered, stored)
        : entered === stored;

    if (!isMatch) {
      console.log("❌ [LOGIN FAILED] Passwords did not match.");
      return res.status(401).json({ error: "Invalid password." });
    }

    // Create JWT 
    const token = jwt.sign(
      { id: user.user_id, role: user.role_id },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1h" }
    );

    // Role logic 
    let role = "customer";
    if (user.role_id === 1) role = "customer";
    if (user.role_id === 2) role = "staff";
    if (user.role_id === 3) role = "admin";

    console.log(`✅ [LOGIN SUCCESS] User logged in as: ${role}`);
    
    return res.json({
      success: true,
      message: "Login successful!",
      token,
      role
    });

  } catch (error) {
    console.error("🚨 [SYSTEM ERROR]:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// ---------------------------------------------------------
// EMAIL & RESET PASSWORD SETUP
// ---------------------------------------------------------

// Temporary memory store for reset codes to avoid database schema errors
const resetCodes = new Map(); 

// Email sender setup (Requires a Gmail App Password)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hariramgeneralstores@gmail.com",
    pass: "kgohhiotnudbqrjj"
  }
});

// ---------------------------------------------------------
// 2. REQUEST RESET CODE ROUTE
// ---------------------------------------------------------
router.post("/forgot-password", async (req, res) => {
  const { identifier } = req.body; 

  try {
    // Find user in DB (using the same safe array extraction logic as login)
    const queryResult = await db.query("SELECT * FROM Users WHERE email = ?", [identifier]);
    let rows = [];
    if (Array.isArray(queryResult) && Array.isArray(queryResult[0])) {
        rows = queryResult[0]; 
    } else if (Array.isArray(queryResult)) {
        rows = queryResult; 
    }
    
    if (rows.length === 0) {
       return res.status(404).json({ error: "No user found with that email." });
    }

    const user = rows[0];

    // Generate a 6-digit random code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save it in server memory for 15 minutes
    resetCodes.set(user.email, {
       code: resetCode,
       expires: Date.now() + 15 * 60 * 1000
    });

    console.log(`\n🔑 [DEV LOG] Reset code for ${user.email} is: ${resetCode}\n`);

    // Send the actual email
    await transporter.sendMail({
       from: '"Hariram General Stores" <hariramgeneralstores@gmail.com>',
       to: user.email,
       subject: "Your Password Reset Code",
       text: `Hello ${user.username},\n\nYour password reset code is: ${resetCode}\n\nThis code will expire in 15 minutes.`
    });

    res.json({ success: true, message: "Reset code sent to your email!" });
  } catch (err) {
    console.error("🚨 [FORGOT PASSWORD ERROR]:", err);
    res.status(500).json({ error: "Failed to send email." });
  }
});

// ---------------------------------------------------------
// 3. VERIFY CODE & RESET PASSWORD ROUTE
// ---------------------------------------------------------
router.post("/reset-password", async (req, res) => {
   const { email, token, newPassword } = req.body;
   
   try {
      // Look up the code in our memory store
      const record = resetCodes.get(email);
      
      // Check if it exists, matches, and hasn't expired
      if (!record || record.code !== token || Date.now() > record.expires) {
         return res.status(400).json({ error: "Invalid or expired reset code." });
      }

      // Hash the brand new password securely
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the database
      await db.query("UPDATE Users SET password_hash = ? WHERE email = ?", [hashedPassword, email]);

      // Delete the token so it can't be used again
      resetCodes.delete(email);

      console.log(`✅ [PASSWORD RESET] Success for user: ${email}`);
      res.json({ success: true, message: "Password reset successfully! You can now log in." });
   } catch (err) {
      console.error("🚨 [RESET PASSWORD ERROR]:", err);
      res.status(500).json({ error: "Failed to reset password." });
   }
});

// ---------------------------------------------------------
// 5. CONTACT FORM — saves to DB and sends emails
// ---------------------------------------------------------
router.post("/contact", async (req, res) => {
  const { name, email, phone, query } = req.body;

  if (!name || !email || !query) {
    return res.status(400).json({ error: "Name, email, and query are required." });
  }

  try {
    await db.query(
      "INSERT INTO contact_submissions (name, email, phone, query) VALUES (?, ?, ?, ?)",
      [name, email, phone || null, query]
    );

    const teamMail = {
      from: "hariramgeneralstores@gmail.com",
      to:   "hariramgeneralstores@gmail.com",
      subject: "[HARIRAM GENERAL STORES] New message from " + name,
      html: "<div style=\"font-family:sans-serif;padding:20px\"><h2>New Contact: " + name + "</h2><p><b>Email:</b> " + email + "</p><p><b>Phone:</b> " + (phone || "N/A") + "</p><p><b>Query:</b> " + query + "</p></div>"
    };

    const confirmMail = {
      from: "hariramgeneralstores@gmail.com",
      to:   email,
      subject: "We received your message — HARIRAM GENERAL STORES Team",
      html: "<div style=\"font-family:sans-serif;padding:20px\"><h2>Hi " + name + ", we got your message!</h2><p>Thank you for contacting the HARIRAM GENERAL STORES team. We will get back to you soon.</p><p><b>Your message:</b> " + query + "</p><p style=\"margin-top:20px;color:#64748b\">— Group 09, Ahmedabad University 2026</p></div>"
    };

    await transporter.sendMail(teamMail);
    await transporter.sendMail(confirmMail);

    res.status(200).json({ message: "Message received and confirmation sent." });
  } catch (error) {
    console.error("Contact Form Error:", error);
    res.status(500).json({ error: "Failed to process your message." });
  }
});

export default router;
