-- drop child tables first to prevent foreign key errors

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS products;

-- drop RBAC tables
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS roles;

DROP DATABASE IF EXISTS inventory_db;
