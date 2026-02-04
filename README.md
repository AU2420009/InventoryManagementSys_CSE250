# Inventory Management System (CSE250 Project)
Inventory management system with MariaDB and NodeJS backend.
This is a project for CSE250 Database Management Systems.

Overview of project: inventory management system

1.	there are products (stocks) (product = entity)
2.	customers place orders (order = entity)
3.	one order can have multiple products, and one product can have multiple orders (many-many relationship)
4.	customers have their phone number stored (customer = entity; phone number = one field of record in customer)
5.	when an order is placed -> stock quantity must decrease
6.	order and product has many-many relationship, thus a bridge/junction table Order-Item is needed


