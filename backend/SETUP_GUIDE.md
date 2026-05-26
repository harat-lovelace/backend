# 🚀 LAUNDRY MANAGEMENT SYSTEM - BACKEND SETUP GUIDE

Complete setup instructions for the PHP/MySQL backend of the Mr. Laba-Laba Laundry Service system.

## 📋 TABLE OF CONTENTS

1. [System Requirements](#system-requirements)
2. [Installation & Setup](#installation--setup)
3. [Database Setup](#database-setup)
4. [Configuration](#configuration)
5. [Testing the Backend](#testing-the-backend)
6. [Frontend Integration](#frontend-integration)
7. [API Endpoints](#api-endpoints)
8. [Troubleshooting](#troubleshooting)

---

## 🔧 SYSTEM REQUIREMENTS

### Minimum Requirements

- **PHP**: 7.4 or higher (8.0+ recommended)
- **MySQL**: 5.7 or higher (8.0+ recommended)
- **Apache**: 2.4 (with mod_rewrite enabled)
- **Node.js**: 16+ (for the frontend)

### Local Development Tools

Choose one of the following:

#### Option 1: XAMPP (Windows/Mac/Linux)
- Download: https://www.apachefriends.org/
- Includes: Apache, MySQL, PHP, phpMyAdmin

#### Option 2: Laragon (Windows)
- Download: https://laragon.org/
- Includes: Apache, MySQL, PHP, phpMyAdmin, Node.js

#### Option 3: WAMP (Windows)
- Download: http://www.wampserver.com/

---

## ⚙️ INSTALLATION & SETUP

### Step 1: Install Local Development Server

#### For XAMPP:
1. Download and install XAMPP from https://www.apachefriends.org/
2. Start Apache and MySQL services
3. Access phpMyAdmin at `http://localhost/phpmyadmin`

#### For Laragon:
1. Download and install Laragon from https://laragon.org/
2. Start Laragon
3. Access phpMyAdmin at `http://localhost/phpmyadmin`

### Step 2: Verify PHP Installation

Open terminal/command prompt and run:
```bash
php -v
```

You should see: PHP 7.4+ or PHP 8.0+

### Step 3: Verify MySQL Installation

Open terminal/command prompt and run:
```bash
mysql -v
```

Or access phpMyAdmin at http://localhost/phpmyadmin

### Step 4: Project Structure

Your project should be in the `htdocs` folder (XAMPP) or `www` folder (Laragon):

```
htdocs/
└── jenjen-po-main/
    ├── src/                    # React frontend
    ├── package.json
    ├── vite.config.ts
    ├── index.html
    └── backend/                # PHP backend (this folder)
        ├── api/
        ├── config/
        ├── middleware/
        ├── database/
        ├── uploads/
        ├── index.php
        ├── .htaccess
        └── ...
```

---

## 🗄️ DATABASE SETUP

### Step 1: Create Database

#### Using phpMyAdmin:

1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Click "New" to create a new database
3. Enter database name: `laundry_system`
4. Click "Create"

#### Using Terminal:

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE laundry_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Show databases to verify
SHOW DATABASES;

# Exit
EXIT;
```

### Step 2: Import Database Schema

#### Using phpMyAdmin:

1. Select the `laundry_system` database
2. Click "Import"
3. Click "Choose File" and select `backend/database/db_laundry_system.sql`
4. Click "Import"

#### Using Terminal:

```bash
# Navigate to your project folder
cd C:\path\to\jenjen-po-main\backend

# Import the SQL file
mysql -u root -p laundry_system < database/db_laundry_system.sql
```

### Step 3: Verify Database Creation

After import, verify all tables were created:

#### Using phpMyAdmin:
1. Select `laundry_system` database
2. You should see these tables:
   - `users`
   - `orders`
   - `bookings`
   - `notifications`
   - `audit_log`

#### Using Terminal:
```bash
mysql -u root -p laundry_system -e "SHOW TABLES;"
```

### Step 4: Verify Sample Data

```bash
mysql -u root -p laundry_system -e "SELECT * FROM users;"
```

You should see:
- customer@demo.com (Customer Demo)
- admin@demo.com (Admin User)

---

## 🔐 CONFIGURATION

### Step 1: Update Database Credentials

Edit: `backend/config/constants.php`

Find these lines:
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'laundry_system');
```

**For XAMPP/Laragon (default):**
- `DB_HOST`: `localhost`
- `DB_USER`: `root`
- `DB_PASS`: `` (empty)
- `DB_NAME`: `laundry_system`

**If you set a MySQL password:**
- Update `DB_PASS` with your password

### Step 2: Update JWT Secret Key

⚠️ **IMPORTANT FOR PRODUCTION:**

In `backend/config/constants.php`, change:

```php
define('JWT_SECRET', 'your-super-secret-key-change-this-in-production-12345');
```

To a strong random string (at least 32 characters):

```php
define('JWT_SECRET', 'aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789');
```

Use a password generator: https://www.random.org/passwords/

### Step 3: Update Frontend URL

In `backend/config/constants.php`, verify:

```php
define('FRONTEND_URL', 'http://localhost:5173');
```

This should match your React dev server URL (usually port 5173 for Vite)

### Step 4: Check .htaccess Rewrite Base

Edit: `backend/.htaccess`

Verify the base path matches your project structure:

```apache
RewriteBase /jenjen-po-main/backend/
```

If your project is at a different path, update accordingly:
```apache
RewriteBase /your-project-path/backend/
```

---

## ✅ TESTING THE BACKEND

### Step 1: Start Development Servers

#### Terminal 1: Start React Frontend
```bash
cd C:\path\to\jenjen-po-main
npm run dev
# or
pnpm dev
```

The frontend should be at: http://localhost:5173

#### Terminal 2: Check Backend
The backend should be accessible at: http://localhost/jenjen-po-main/backend

### Step 2: Test API Endpoint

Open your browser or use Postman/Insomnia:

#### Get API Info
```
GET http://localhost/jenjen-po-main/backend/
```

You should see the API information and available endpoints.

### Step 3: Test User Registration

Using **Postman** or **cURL**:

```bash
# Using cURL
curl -X POST http://localhost/jenjen-po-main/backend/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "confirm_password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 3,
    "email": "test@example.com",
    "full_name": "Test User",
    "role": "customer",
    "token": "eyJhbGc..."
  }
}
```

### Step 4: Test User Login

```bash
curl -X POST http://localhost/jenjen-po-main/backend/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@demo.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 1,
    "email": "customer@demo.com",
    "full_name": "Customer Demo",
    "role": "customer",
    "token": "eyJhbGc..."
  }
}
```

### Step 5: Test Protected Endpoint

Use the token from login to test a protected endpoint:

```bash
curl -X GET http://localhost/jenjen-po-main/backend/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Replace `YOUR_TOKEN_HERE` with the token from the login response.

### Step 6: Using Postman (Recommended)

1. Download Postman: https://www.postman.com/downloads/
2. Import the API collection (create one or use examples above)
3. Test each endpoint with different request methods

---

## 🔗 FRONTEND INTEGRATION

### Step 1: Update Frontend API Base URL

Edit: `src/app/components/AuthContext.tsx`

Add API base URL constant:

```typescript
const API_BASE_URL = 'http://localhost/jenjen-po-main/backend';
```

### Step 2: Update Auth Context

Replace localStorage calls with API calls:

```typescript
// Before (localStorage):
const users = JSON.parse(localStorage.getItem('users') || '[]');

// After (API call):
const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const data = await response.json();
```

### Step 3: Store JWT Token

Instead of storing user object, store JWT token:

```typescript
// Save token
localStorage.setItem('authToken', data.token);

// Retrieve token for protected requests
const token = localStorage.getItem('authToken');

// Use in API calls
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
```

### Step 4: Update All API Calls

For each component that makes API calls:

1. **LoginPage.tsx** - Update login API call
2. **SignupPage.tsx** - Update signup API call
3. **OrderPage.tsx** - Update order creation
4. **SchedulePage.tsx** - Update booking creation
5. **AdminOrderManagement.tsx** - Update order management
6. **AdminScheduleManagement.tsx** - Update booking management

### Step 5: Handle API Errors

Add proper error handling:

```typescript
try {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  const data = await response.json();
  return data;
} catch (error) {
  console.error('API Error:', error);
  // Show user-friendly error message
}
```

### Step 6: Add Loading States

Add loading state during API requests:

```typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async (formData) => {
  setLoading(true);
  try {
    // API call here
  } finally {
    setLoading(false);
  }
};
```

---

## 📚 API ENDPOINTS

### Authentication

#### Register User
```
POST /api/auth/signup
Content-Type: application/json

{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirm_password": "password123"
}

Response: { success, message, data: { id, email, role, token } }
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: { success, message, data: { id, email, role, token } }
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer {token}

Response: { success, message, data: { id, email, full_name, role } }
```

### Orders

#### Create Order
```
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "customer_name": "John Doe",
  "contact_number": "09123456789",
  "laundry_type": "wash-fold",
  "weight": 5.0,
  "special_instructions": "Gentle care only"
}

Response: { success, message, data: { order object } }
```

#### List Orders
```
GET /api/orders?page=1&per_page=10&status=Received
Authorization: Bearer {token}

Response: { success, message, data: [...], pagination: { ... } }
```

#### Get Single Order
```
GET /api/orders?id=1
Authorization: Bearer {token}

Response: { success, message, data: { order object } }
```

#### Update Order
```
PUT /api/orders?id=1
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "Washing",
  "special_instructions": "Updated instructions"
}

Response: { success, message, data: { updated order } }
```

#### Delete Order
```
DELETE /api/orders?id=1
Authorization: Bearer {token}

Response: { success, message, data: { id } }
```

#### Search Orders
```
GET /api/orders/search?q=John&page=1&per_page=10
Authorization: Bearer {token}

Response: { success, message, data: [...], pagination: { ... } }
```

### Bookings

#### Create Booking
```
POST /api/bookings
Authorization: Bearer {token}
Content-Type: application/json

{
  "booking_date": "2024-06-15",
  "booking_time": "10:00 AM",
  "service_type": "dropoff"
}

Response: { success, message, data: { booking object } }
```

#### List Bookings
```
GET /api/bookings?page=1&status=pending&date=2024-06-15
Authorization: Bearer {token}

Response: { success, message, data: [...], pagination: { ... } }
```

#### Get Single Booking
```
GET /api/bookings?id=1
Authorization: Bearer {token}

Response: { success, message, data: { booking object } }
```

#### Update Booking
```
PUT /api/bookings?id=1
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "accepted"
}

Response: { success, message, data: { updated booking } }
```

#### Delete Booking
```
DELETE /api/bookings?id=1
Authorization: Bearer {token}

Response: { success, message, data: { id } }
```

#### Check Availability
```
GET /api/bookings/availability?date=2024-06-15

Response: {
  success, 
  message, 
  data: {
    date,
    slots: [
      { time: "08:00 AM", available: true, booked_count: 0 },
      ...
    ]
  }
}
```

---

## 🔧 TROUBLESHOOTING

### Issue: "Database connection failed"

**Solution:**
1. Check MySQL is running
2. Verify database credentials in `config/constants.php`
3. Ensure database `laundry_system` exists
4. Check MySQL username/password

### Issue: "404 Not Found" on API endpoints

**Solution:**
1. Verify Apache mod_rewrite is enabled
2. Check `.htaccess` RewriteBase path
3. Ensure you're using the correct URL structure
4. Restart Apache

### Issue: "CORS error" in browser console

**Solution:**
1. Verify `ALLOWED_ORIGINS` in `config/constants.php`
2. Add your frontend URL to the array
3. Make sure backend is sending correct CORS headers

### Issue: "Unauthorized: Invalid or missing token"

**Solution:**
1. Ensure you're including Authorization header
2. Token format should be: `Bearer eyJhbGc...`
3. Check token hasn't expired (default: 7 days)
4. Verify JWT_SECRET is the same on server

### Issue: "File upload not working"

**Solution:**
1. Check `uploads/` folder exists and is writable
2. Verify file size is under MAX_UPLOAD_SIZE
3. Check file type is in ALLOWED_FILE_TYPES
4. Ensure proper permissions: `chmod 755 uploads/`

### Issue: "Password validation always fails"

**Solution:**
1. Verify password hashing in `password_hash()`
2. Use `password_verify()` for verification
3. Check PASSWORD_ALGO constant is correct
4. Test with a fresh password

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| Connection refused | MySQL not running | Start MySQL service |
| Access denied | Wrong credentials | Check DB_USER and DB_PASS |
| Table doesn't exist | SQL import failed | Re-import database schema |
| Headers already sent | Output before header() | Remove any echo before header() |
| Token expired | Token older than expiration | Login again to get new token |

---

## 📞 SUPPORT

For issues or questions:

1. Check the troubleshooting section above
2. Review error logs in `logs/` folder
3. Check browser console for frontend errors
4. Review Apache error log for server errors
5. Test API endpoints with Postman

---

## 🎉 You're Ready!

Your backend is now set up and ready to use. 

Next steps:
1. ✅ Database created and populated
2. ✅ Backend configured and tested
3. ⬜ Frontend integration (see Frontend Integration section)
4. ⬜ Test complete system
5. ⬜ Deploy to production

Happy coding! 🚀
