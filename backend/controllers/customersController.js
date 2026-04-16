import db from "../db.js";

// GET all customers
export const getCustomers = async (req, res) => {
  try {
    const queryResult = await db.query("SELECT * FROM customers");

    let rows = [];
    if (Array.isArray(queryResult) && Array.isArray(queryResult[0])) {
      rows = queryResult[0];
    } else if (Array.isArray(queryResult)) {
      rows = queryResult;
    }

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

    const result = await db.query(
      "INSERT INTO customers (Name, Phone) VALUES (?, ?)",
      [Name, Phone]
    );

    res.json({
      message: "Customer created successfully",
      customerId:
        (typeof result?.insertId === "number" && result.insertId) ||
        (Array.isArray(result) && result[0]?.insertId) ||
        null
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating customer");
  }
};

export const deleteCustomer = async (req, res) => {
  const customerId = req.params.customerId ?? req.params.id;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Cancel unfinished orders
    await connection.query(
      `UPDATE orders
      SET Status = 'Cancelled'
      WHERE Customer_ID = ? AND Status = 'Processing'`,
      [customerId]
    );

    // 2. Delete cancelled + processing orders (optional)
    await connection.query(
      `DELETE FROM orders
      WHERE Customer_ID = ? AND Status != 'Completed'`,
      [customerId]
    );

    // 3. Delete customer
    await connection.query(
      "DELETE FROM customers WHERE Customer_ID = ?",
      [customerId]
    );

    await connection.commit();

    res.json({ message: "Customer deleted successfully" });

  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).send(err.message);

  } finally {
    connection.release();
  }
};
