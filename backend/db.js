import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "localhost",
  user: "dbuser",
  password: "dbpassword",
  database: "inventory_db"
});

export default db;
