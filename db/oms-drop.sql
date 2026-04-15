-- drop child tables first to prevent foreign key errors

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS products;

-- drop RBAC tables
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS sessions;


DROP DATABASE IF EXISTS inventory_db;
