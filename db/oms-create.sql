CREATE DATABASE IF NOT EXISTS inventory_db;
USE inventory_db;

CREATE TABLE IF NOT EXISTS products (
    Product_ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    Quantity_Available INT NOT NULL CHECK (Quantity_Available >= 0)
);

CREATE TABLE IF NOT EXISTS customers (
    Customer_ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Phone VARCHAR(15)
);

CREATE TABLE IF NOT EXISTS orders (
    Order_ID INT AUTO_INCREMENT PRIMARY KEY,
    Customer_ID INT NOT NULL,
    Order_Date DATE NOT NULL,
    Total_Amount DECIMAL(10,2),

    FOREIGN KEY (Customer_ID) REFERENCES customers(Customer_ID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
    Order_ID INT NOT NULL,
    Product_ID INT NOT NULL,
    Quantity_Ordered INT NOT NULL,
    Price_At_Order_Time DECIMAL(10,2) NOT NULL,

    PRIMARY KEY (Order_ID, Product_ID),

    FOREIGN KEY (Order_ID) REFERENCES orders(Order_ID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    FOREIGN KEY (Product_ID) REFERENCES products(Product_ID)
        ON DELETE CASCADE
);
