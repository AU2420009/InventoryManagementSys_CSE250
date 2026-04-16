import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import db from "./db.js";

// Import all your route files
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import customerRoutes from "./routes/customers.js";
import authRoutes from "./routes/auth.js"; // <-- The new auth route imported

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Prevent "Do not know how to serialize a BigInt" when DB returns BIGINT values.
app.set("json replacer", (key, value) =>
  typeof value === "bigint" ? value.toString() : value
);

app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Middleware for API endpoints
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/customers", customerRoutes);
app.use("/api/auth", authRoutes); // <-- The new auth route connected

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Test the database connection
async function testDB() {
  try {
    const [rows] = await db.query("SELECT 1");
    console.log("Database connected successfully!");
  } catch (err) {
    console.error("Database connection failed:", err);
  }
}

testDB();
