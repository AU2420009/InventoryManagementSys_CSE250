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

-- RBAC Tables (updated)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff', 'customer') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
    session_id VARCHAR(128) PRIMARY KEY,
    -- Must be VARCHAR(20) to match the new Users table
    user_id VARCHAR(20) NOT NULL, 
    -- We keep the role name here as a string for fast access in Node.js
    role_name VARCHAR(20) NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    -- Linking to the new Users table
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);


--For login
CREATE TABLE roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(20) UNIQUE NOT NULL
);

INSERT INTO roles (role_name)
VALUES ('customer'), ('staff'), ('admin');

CREATE TABLE Users (
    user_id VARCHAR(20) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

INSERT INTO Users (user_id, username, email, password_hash, role_id)
VALUES
('1', 'AU24220001', 'ankit.k@ahduni.edu.in', '380007', 1),
('2', 'AU24220002', 'milan.s@ahduni.edu.in', '380007', 1),
('3', 'AU24220003', 'anant.in@ahduni.edu.in', '380007', 1);

INSERT INTO Users (user_id, username, email, password_hash, role_id)
VALUES
('4', 'AU2420147', 'ankit97963@gmail.com', '380008', 2),
('5', 'AU2420148', 'prakash48204@gmail.com', '380008', 2), 
('6', 'AU2420149', 'ankit97563@gmail.com', '380008', 2), 
('7', 'AU2420150', 'ankit95663@gmail.com', '380008', 2);

INSERT INTO Users (user_id, username, email, password_hash, role_id)
VALUES
('8', 'AU2420151', 'hariramgeneralstores@gmail.com', '380009', 3);

