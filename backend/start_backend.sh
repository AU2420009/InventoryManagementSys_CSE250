#!/usr/bin/bash

echo "Setting up backend environment..."

# Create .env file with credentials
cat > .env <<EOF
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=new_password
DB_NAME=inventory_db
EOF

echo ".env file created."

# Verify Node.js and npm are installed
command -v node >/dev/null 2>&1 || { echo "Node.js is not installed"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm is not installed"; exit 1; }

# Install dependencies
echo "Installing dependencies..."
npm install

# Check if port 5000 is in use
if lsof -i:5000 >/dev/null 2>&1; then
  echo "Warning: Port 5000 is already in use."
fi

# Start server
echo "Starting server..."
node server.js
