# User Authentication Flow

### The application will follow a session-based authentication flow:

## 1. User Registration
- User submits username, password, and role (admin/user/customer)
- Backend hashes password using bcrypt
- Stores user in `users` table with role
- Returns success message

## 2. User Login
- User submits username and password
- Backend validates credentials against `users` table
- If valid, generates random session ID (128-char string)
- Creates session record in `sessions` table: `{session_id, user_id, role, expires_at}`
- Returns session ID to frontend
- Frontend stores session ID in localStorage

## 3. Authenticated Requests
- Frontend includes session ID in `Authorization: Bearer <session_id>` header
- Backend middleware:
  1. Validates session ID exists in `sessions` table
  2. Checks session hasn't expired
  3. Retrieves user role from session
  4. Proceeds to authorization check

## 4. Role-Based Authorization
- **Admin**: Full access (create/read/update/delete products, orders, customers, manage staff)
- **Staff**: Limited access (read products, create/update orders, manage inventory)
- **Customer**: Customer access (view products, place orders, view own orders)

## 5. Session Management
- Sessions expire after 24 hours
- Backend automatically cleans expired sessions
- Logout removes session record from database

## Security Features
- Passwords are hashed, never stored in plain text
- Session IDs are cryptographically random
- All authorization happens server-side
- Frontend cannot manipulate user roles 