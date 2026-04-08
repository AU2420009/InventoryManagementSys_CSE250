-- drop child tables first to prevent foreign key errors

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS products;
DROP DATABASE IF EXISTS inventory_db;
