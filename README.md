# Inventory Management System (CSE250 – DBMS)

## 1. Project Overview

This project is an **Inventory Management System** developed as part of the  
**CSE250 – Database Management Systems** course.

The system is designed to manage product stock, customer orders, and inventory updates using a **relational database (MariaDB)** and a **NodeJS (Express) backend**.  
It focuses on applying core DBMS concepts such as entity relationships, normalization, primary and foreign keys, and many-to-many relationships.



## 2. Key Concepts and Features

- **Product Management**  
  Products are maintained as stock items with available inventory quantity.

- **Customer Management**  
  Customer details, including phone numbers, are stored in the database.

- **Order Management**  
  Customers place orders, and each order can contain multiple products.

- **Many-to-Many Relationship Handling**  
  The relationship between orders and products is modeled using a bridge (junction) table called **Order-Item**.

- **Inventory Update Logic**  
  When an order is placed, the stock quantity of the corresponding products decreases accordingly.



## 3. Technology Stack

- **Database**: MariaDB  
- **Backend**: NodeJS with Express  
- **Frontend**: Vite (HTML, CSS, JavaScript)  
- **Language**: SQL (DDL, DML) and JavaScript  
- **Environment**: Linux (WSL)




## 4. Database Design

The database consists of the following main entities:

- **Product**: Stores product details and available stock quantity  
- **Customer**: Stores customer information and phone number  
- **Order**: Represents an order placed by a customer  
- **Order-Item**: A junction table to model the many-to-many relationship between orders and products  

A composite primary key is used in the **Order-Item** table to ensure unique combinations of Order-ID and Product-ID.




## 5. Project Documentation

Detailed documentation is available in the **GitHub Wiki**:

https://github.com/AU2420009/InventoryManagementSys_CSE250/wiki

The wiki includes:

- System Architecture
- Database Design
- API Design
- Deployment Guide
- Installation Instructions



## 6. Team

Developed as part of the **CSE250 Database Management Systems Course** at Ahmedabad University.

Team Members:

- Anant Narayan
- Ankit Kumar
- Milan Shah





