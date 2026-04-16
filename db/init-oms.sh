#!/bin/bash
echo "Dropping existing database..."
mariadb -u root -p <<EOF
DROP DATABASE IF EXISTS inventory_db;
EOF

echo "Creating and populating database..."
mariadb -u root -p <<EOF
SOURCE ./db/oms-create.sql;
USE inventory_db;
SOURCE ./db/oms-populate.sql;
show tables;
EOF
