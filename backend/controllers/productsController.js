import db from "../db.js";

// GET all products
export const getProducts = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching products");
  }
};

// CREATE product
export const createProduct = async (req, res) => {
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
};

// UPDATE product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { Name, Price, Quantity_Available } = req.body;

    await db.query(
      "UPDATE products SET Name=?, Price=?, Quantity_Available=? WHERE Product_ID=?",
      [Name, Price, Quantity_Available, id]
    );

    res.json({ message: "Product updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating product");
  }
};

// DELETE product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "DELETE FROM products WHERE Product_ID=?",
      [id]
    );

    res.json({ message: "Product deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting product");
  }
};
