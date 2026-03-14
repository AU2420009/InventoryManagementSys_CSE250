import express from "express";
import db from "../db.js";

const router = express.Router();

// GET all products
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching products");
  }
});

// Add a new product
router.post("/", async (req, res) => {
  try {
    const { Name, Price, Quantity_Available } = req.body;

    const [result] = await db.query(
      "INSERT INTO products (Name, Price, Quantity_Available) VALUES (?, ?, ?)",
      [Name, Price, Quantity_Available]
    );

    res.json({
      message: "Product added successfully",
      productId: result.insertId
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding product");
  }
});

// Update a product
router.put("/:id", async (req, res) => {
  try {
    const { Name, Price, Quantity_Available } = req.body;
    const { id } = req.params;

    const [result] = await db.query(
      "UPDATE products SET Name=?, Price=?, Quantity_Available=? WHERE Product_ID=?",
      [Name, Price, Quantity_Available, id]
    );

    res.json({
      message: "Product updated successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating product");
  }
});

// Delete a product
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "DELETE FROM products WHERE Product_ID=?",
      [id]
    );

    res.json({
      message: "Product deleted successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting product");
  }
});

export default router;
