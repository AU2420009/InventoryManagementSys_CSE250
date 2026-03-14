import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import db from "./db.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

// first API route - get all products
app.get("/products", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching products");
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// test the database connection
async function testDB() {
  try {
    const [rows] = await db.query("SELECT 1");
    console.log("Database connected successfully!");
  } catch (err) {
    console.error("Database connection failed:", err);
  }
}

testDB();
