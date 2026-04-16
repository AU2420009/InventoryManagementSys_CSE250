import db from "../db.js";

/* 
When an order is placed, what this function does is:
1. Check product exists
2. Check stock availability
3. Create order
4. Insert order items
5. Reduce product stock
6. Commit transaction 

If anything fails, rollback ensures database returns to previous state
*/

// CREATE ORDER
export const createOrder = async (req, res) => {

  const { Customer_ID, items } = req.body;

  const connection = await db.getConnection();

  try {
    if (!Customer_ID || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Customer_ID and items are required" });
    }

    for (const item of items) {
      if (
        item == null ||
        !Number.isInteger(item.Product_ID) ||
        !Number.isInteger(item.Quantity_Ordered) ||
        item.Quantity_Ordered <= 0
      ) {
        return res.status(400).json({
          error: "Each item must have integer Product_ID and positive integer Quantity_Ordered"
        });
      }
    }

    await connection.beginTransaction();

    let totalAmount = 0;

    for (let item of items) {

      const product = await connection.query(
        "SELECT Price, Quantity_Available FROM products WHERE Product_ID=?",
        [item.Product_ID]
      );

      if (product.length === 0) {
        throw new Error("Product not found");
      }

      const price = product[0].Price;
      const stock = product[0].Quantity_Available;

      if (stock < item.Quantity_Ordered) {
        throw new Error("Insufficient stock for product ID " + item.Product_ID);
      }

      totalAmount += price * item.Quantity_Ordered;
    }

    const orderResult = await connection.query(
      "INSERT INTO orders (Customer_ID, Order_Date, Total_Amount) VALUES (?, CURDATE(), ?)",
      [Customer_ID, totalAmount]
    );

    const orderId = Number(orderResult?.insertId ?? 0) || null;
    if (!orderId) {
      throw new Error("Failed to create order");
    }

    for (let item of items) {

      const product = await connection.query(
        "SELECT Price FROM products WHERE Product_ID=?",
        [item.Product_ID]
      );

      const price = product[0].Price;

      await connection.query(
        "INSERT INTO order_items (Order_ID, Product_ID, Quantity_Ordered, Price_At_Order_Time) VALUES (?, ?, ?, ?)",
        [orderId, item.Product_ID, item.Quantity_Ordered, price]
      );

      await connection.query(
        "UPDATE products SET Quantity_Available = Quantity_Available - ? WHERE Product_ID=?",
        [item.Quantity_Ordered, item.Product_ID]
      );
    }

    await connection.commit();

    res.json({
      message: "Order created successfully",
      orderId: Number(orderId) || null
    });

  } catch (err) {

    await connection.rollback();

    console.error(err);
    res.status(500).json({ error: err.message });

  } finally {

    connection.release();

  }

};

export const getCustomerOrders = async (req, res) => {
  const { customerId } = req.params;

  try {
    const queryResult = await db.query(
      `SELECT * FROM orders WHERE Customer_ID = ? ORDER BY Order_Date DESC`,
      [customerId]
    );

    // Handle MariaDB query result format
    let orders = [];
    if (Array.isArray(queryResult) && Array.isArray(queryResult[0])) {
        orders = queryResult[0]; 
    } else if (Array.isArray(queryResult)) {
        orders = queryResult; 
    }

    // Ensure orders is an array
    if (!Array.isArray(orders)) {
      orders = [];
    }

    for (let order of orders) {
      const itemsResult = await db.query(
        `SELECT oi.Product_ID, p.Name, oi.Quantity_Ordered, oi.Price_At_Order_Time
        FROM order_items oi
        JOIN products p ON oi.Product_ID = p.Product_ID
        WHERE oi.Order_ID = ?`,
        [order.Order_ID]
      );

      // Handle items result format
      let items = [];
      if (Array.isArray(itemsResult) && Array.isArray(itemsResult[0])) {
          items = itemsResult[0]; 
      } else if (Array.isArray(itemsResult)) {
          items = itemsResult; 
      }

      order.items = items;
    }

    res.json(orders);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching orders");
  }
};

export const deleteOrder = async (req, res) => {
  const orderId = req.params.orderId ?? req.params.id;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const existingOrder = await connection.query(
      "SELECT Order_ID FROM orders WHERE Order_ID = ?",
      [orderId]
    );

    if (!Array.isArray(existingOrder) || existingOrder.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Order not found" });
    }

    // Get order items first
    const items = await connection.query(
      "SELECT Product_ID, Quantity_Ordered FROM order_items WHERE Order_ID = ?",
      [orderId]
    );

    // Restore stock (only if items still exist)
    if (Array.isArray(items) && items.length > 0) {
      for (let item of items) {
        await connection.query(
          "UPDATE products SET Quantity_Available = Quantity_Available + ? WHERE Product_ID = ?",
          [item.Quantity_Ordered, item.Product_ID]
        );
      }
    }

    // Delete order (cascade deletes order_items)
    await connection.query(
      "DELETE FROM orders WHERE Order_ID = ?",
      [orderId]
    );

    await connection.commit();

    res.json({ message: "Order cancelled successfully" });

  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).send(err.message);

  } finally {
    connection.release();
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const queryResult = await db.query(
      "SELECT * FROM orders ORDER BY Order_Date DESC"
    );

    let orders = [];
    if (Array.isArray(queryResult) && Array.isArray(queryResult[0])) {
      orders = queryResult[0];
    } else if (Array.isArray(queryResult)) {
      orders = queryResult;
    }

    if (!Array.isArray(orders)) {
      orders = [];
    }

    for (let order of orders) {
      const itemsResult = await db.query(
        `SELECT oi.Product_ID, p.Name, oi.Quantity_Ordered, oi.Price_At_Order_Time
         FROM order_items oi
         JOIN products p ON oi.Product_ID = p.Product_ID
         WHERE oi.Order_ID = ?`,
        [order.Order_ID]
      );

      let items = [];
      if (Array.isArray(itemsResult) && Array.isArray(itemsResult[0])) {
        items = itemsResult[0];
      } else if (Array.isArray(itemsResult)) {
        items = itemsResult;
      }

      order.items = items;
    }

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching all orders");
  }
};
