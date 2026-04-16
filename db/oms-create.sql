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
    Status VARCHAR(20) DEFAULT 'Processing',
    FOREIGN KEY (Customer_ID) REFERENCES customers(Customer_ID)
        ON DELETE RESTRICT
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

-- RBAC Tables
CREATE TABLE IF NOT EXISTS roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(20) UNIQUE NOT NULL
);

INSERT INTO roles (role_name)
VALUES ('customer'), ('staff'), ('admin');

CREATE TABLE IF NOT EXISTS Users (
    user_id VARCHAR(20) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(128) PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL,
    role_name VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS contact_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    query TEXT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);