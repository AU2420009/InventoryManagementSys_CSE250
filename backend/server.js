import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import db from "./db.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import customerRoutes from "./routes/customers.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

// middleware for API endpoint - products
app.use("/products", productRoutes);

// middleware for API endpoint - orders
app.use("/orders", orderRoutes);

// middleware for API endpoint - customers
app.use("/customers", customerRoutes);

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
