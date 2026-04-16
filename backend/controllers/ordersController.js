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

    await connection.beginTransaction();

    let totalAmount = 0;

    for (let item of items) {

      const [product] = await connection.query(
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

    const [orderResult] = await connection.query(
      "INSERT INTO orders (Customer_ID, Order_Date, Total_Amount, status) VALUES (?, CURDATE(), ?, 'Processing')",
      [Customer_ID, totalAmount]
    );

    const orderId = orderResult.insertId;

    for (let item of items) {

      const [product] = await connection.query(
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
      orderId: orderId
    });

  } catch (err) {

    await connection.rollback();

    console.error(err);
    res.status(500).send(err.message);

  } finally {

    connection.release();

  }

};

export const getCustomerOrders = async (req, res) => {
  const { customerId } = req.params;

  try {
    const [orders] = await db.query(
      `SELECT * FROM orders WHERE Customer_ID = ? ORDER BY Order_Date DESC`,
      [customerId]
    );

    for (let order of orders) {
      const [items] = await db.query(
        `SELECT oi.Product_ID, p.Name, oi.Quantity_Ordered, oi.Price_At_Order_Time
        FROM order_items oi
        JOIN products p ON oi.Product_ID = p.Product_ID
        WHERE oi.Order_ID = ?`,
        [order.Order_ID]
      );

      order.items = items;
    }

    res.json(orders);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching orders");
  }
};

export const deleteOrder = async (req, res) => {
  const { orderId } = req.params;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Get order items first
    const [items] = await connection.query(
      "SELECT Product_ID, Quantity_Ordered FROM order_items WHERE Order_ID = ?",
      [orderId]
    );

    if (items.length === 0) {
      throw new Error("Order not found");
    }

    // Restore stock
    for (let item of items) {
      await connection.query(
        "UPDATE products SET Quantity_Available = Quantity_Available + ? WHERE Product_ID = ?",
        [item.Quantity_Ordered, item.Product_ID]
      );
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
