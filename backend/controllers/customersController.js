import db from "../db.js";

// GET all customers
export const getCustomers = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM customers");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching customers");
  }
};

// CREATE customer
export const createCustomer = async (req, res) => {
  try {
    const { Name, Phone } = req.body;

    const [result] = await db.query(
      "INSERT INTO customers (Name, Phone) VALUES (?, ?)",
      [Name, Phone]
    );

    res.json({
      message: "Customer created successfully",
      customerId: result.insertId
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating customer");
  }
};