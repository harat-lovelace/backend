# Complete Setup Guide for Mr. Laba-Laba Frontend + Backend Integration

## Project Overview
- **Frontend**: React + Vite (running on `http://localhost:5173`)
- **Backend**: PHP + Apache (running through Laragon at `http://localhost/jenjen-po-main/backend`)
- **Database**: MySQL (laundry_system)
- **Location**: `c:\laragon\www\jenjen-po-main`

## FINAL VERIFIED SETUP

### Backend API Base URL
```
http://localhost/jenjen-po-main/backend
```

### API Endpoints
All endpoints follow this format: `http://localhost/jenjen-po-main/backend/{endpoint}`

**Authentication Endpoints:**
- `POST /auth/signup` - Create new user account
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user info (requires token)
- `POST /auth/logout` - User logout
- `GET /health` - Health check (verify backend is running)

**Order Endpoints:**
- `GET /orders` - List all orders
- `POST /orders` - Create new order
- `GET /orders?id={id}` - Get single order
- `PUT /orders?id={id}` - Update order
- `DELETE /orders?id={id}` - Delete order
- `GET /orders?q={term}` - Search orders

**Booking Endpoints:**
- `GET /bookings` - List all bookings
- `POST /bookings` - Create new booking
- `GET /bookings?id={id}` - Get single booking
- `PUT /bookings?id={id}` - Update booking
- `DELETE /bookings?id={id}` - Delete booking
- `GET /bookings?date={date}` - Check availability for date

**Other Endpoints:**
- `GET /notifications` - Get notifications
- `POST /notifications` - Manage notifications
- `POST /profile` - Update user profile

## STEP-BY-STEP SETUP INSTRUCTIONS

### 1. Database Setup

**Create and import the database:**

```bash
# Using MySQL command line:
mysql -u root -p < c:\laragon\www\jenjen-po-main\backend\database\db_laundry_system.sql

# Or manually:
1. Open phpMyAdmin (use Laragon's button)
2. Create database: "laundry_system"
3. Import file: backend/database/db_laundry_system.sql
```

**Insert test data (optional):**
```sql
-- Customer account for testing
INSERT INTO users (email, password, full_name, role, phone_number) 
VALUES ('customer@example.com', '$2y$10$...[bcrypt hash of 'password123']', 'Test Customer', 'customer', '+1234567890');

-- Admin account for testing  
INSERT INTO users (email, password, full_name, role, phone_number) 
VALUES ('admin@laundry.com', '$2y$10$...[bcrypt hash of 'admin123']', 'Admin User', 'admin', '+0987654321');
```

### 2. Laragon Configuration

**Start Laragon Services:**

1. Open Laragon
2. Click "Start All" or ensure:
   - ✅ Apache is running (green status bar)
   - ✅ MySQL is running (green status bar)
3. Verify:
   - Apache on port 80
   - MySQL on port 3306

**Project is auto-accessible at:**
- Frontend: http://localhost:5173
- Backend: http://localhost/jenjen-po-main/backend

### 3. Frontend Setup

**Terminal 1: Start Frontend Development Server**

```bash
cd c:\laragon\www\jenjen-po-main\frontend

npm install  # First time only

npm run dev
```

Expected output:
```
  VITE v5.0.0  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### 4. Backend Configuration

**Files already configured:**
- ✅ `backend/.env` - Database credentials (root user, empty password for local Laragon)
- ✅ `backend/config/constants.php` - CORS headers, API version
- ✅ `frontend/.env.local` - API_BASE_URL set to Laragon path
- ✅ `frontend/vite.config.ts` - Vite proxy configured

**Database credentials (in backend/config/constants.php):**
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');           // Empty for Laragon default
define('DB_NAME', 'laundry_system');
```

### 5. Verification Checklist

**Backend Health Check:**
```bash
# Test in browser or curl:
curl http://localhost/jenjen-po-main/backend/health

# Expected response:
{
  "success": true,
  "message": "Backend connected",
  "status": "healthy",
  "database": "connected",
  "version": "1.0.0"
}
```

**Frontend Check:**
1. Open http://localhost:5173 in browser
2. Go to Sign Up page
3. Should NOT show "Unable to connect to backend server" error
4. Form should be visible and functional

**Test Signup:**
1. Fill in signup form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "password123"
   - Role: "Customer"
2. Click "Create Customer account"
3. Should redirect to dashboard on success

### 6. Troubleshooting

**Issue: "Unable to connect to backend server"**

Solutions:
- [ ] Verify Apache is running in Laragon
- [ ] Check MySQL is running in Laragon  
- [ ] Open http://localhost/jenjen-po-main/backend/health in browser to verify
- [ ] Check browser console for CORS errors
- [ ] Verify database is imported and created
- [ ] Check PHP error logs in Laragon

**Issue: Database connection error**

Solutions:
- [ ] Import db_laundry_system.sql into MySQL
- [ ] Check DB credentials in backend/config/constants.php
- [ ] Verify MySQL is running
- [ ] Check phpMyAdmin (http://localhost:7681) for laundry_system database

**Issue: CORS errors in browser console**

Solutions:
- [ ] Verify ALLOWED_ORIGINS includes http://localhost:5173
- [ ] Check backend/config/constants.php
- [ ] Ensure Apache headers mod is enabled

## DETAILED ARCHITECTURE

### Frontend Structure
```
frontend/
├── .env                          # API URL (Laragon path)
├── .env.local                    # Local overrides
├── vite.config.ts               # Vite config with proxy
├── src/
│   ├── app/
│   │   ├── apiConfig.ts         # API base URL configuration
│   │   ├── services/
│   │   │   └── api.ts           # Centralized API service
│   │   ├── components/
│   │   │   ├── AuthContext.tsx  # Auth provider using api.ts
│   │   │   ├── SignupPage.tsx   # Uses useAuth()
│   │   │   ├── LoginPage.tsx    # Uses useAuth()
│   │   │   └── [other components using api.ts]
```

### Backend Structure
```
backend/
├── config/
│   ├── constants.php            # CORS, DB config, API version
│   └── Database.php             # MySQL connection class
├── middleware/
│   ├── Response.php             # JSON response formatting
│   ├── Auth.php                 # JWT token handling
│   └── Validator.php            # Input validation
├── controllers/
│   ├── auth/
│   │   ├── signup.php
│   │   ├── login.php
│   │   ├── logout.php
│   │   └── me.php
│   ├── orders/
│   │   ├── create.php
│   │   ├── list.php
│   │   ├── get.php
│   │   ├── update.php
│   │   ├── delete.php
│   │   └── search.php
│   ├── bookings/
│   │   └── [similar CRUD endpoints]
│   ├── notifications/
│   │   └── [notification handlers]
│   ├── profile.php
│   ├── admin_stats.php
│   └── health.php               # NEW: Health check endpoint
├── routes/
│   └── api.php                  # UPDATED: Main router with health check
├── database/
│   └── db_laundry_system.sql   # Database schema
├── index.php                    # Entry point
├── init.php                     # Bootstrap file
└── router.php                   # Alternative router

```

## API Communication Flow

### Signup Example
```
1. Frontend (SignupPage.tsx):
   const result = await signup(name, email, password, role)
   
2. AuthContext.tsx:
   const result = await apiPost('/auth/signup', { name, email, password, role })
   
3. API Service (services/api.ts):
   POST http://localhost/jenjen-po-main/backend/auth/signup
   Headers: { 'Content-Type': 'application/json' }
   Body: { name: "John", email: "john@example.com", password: "...", role: "customer" }
   
4. Backend Router (routes/api.php):
   Parses /auth/signup -> endpoint='auth', method='signup'
   Calls controllers/auth/signup.php
   
5. Signup Controller (controllers/auth/signup.php):
   - Receives JSON input (maps 'name' to 'full_name' internally)
   - Validates input
   - Hashes password
   - Inserts into users table
   - Generates JWT token
   - Returns JSON response
   
6. Response back to Frontend:
   {
     "success": true,
     "message": "User registered successfully",
     "data": {
       "id": 1,
       "email": "john@example.com",
       "name": "John",
       "role": "customer",
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     },
     "timestamp": "2026-05-27 10:30:45"
   }
   
7. Frontend stores in localStorage and redirects to dashboard
```

## CORS Headers Configuration

The backend automatically sends these headers:
```php
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
Access-Control-Allow-Credentials: true
```

Allowed origins are defined in `backend/config/constants.php`:
```php
define('ALLOWED_ORIGINS', [
    'http://localhost:5173',      // Vite dev server
    'http://localhost:3000',      // Alternative port
    'http://localhost',            // Standard HTTP
    'http://127.0.0.1'            // Localhost IP
]);
```

## Quick Start Commands

```bash
# Terminal 1: Start Frontend
cd c:\laragon\www\jenjen-po-main\frontend
npm run dev

# Terminal 2: Open Browser
http://localhost:5173

# Ensure Laragon:
- Apache is running (handles PHP backend at /jenjen-po-main/backend)
- MySQL is running (localhost:3306)
- Database laundry_system is created and imported
```

## Production Notes

For production deployment:
1. Update ALLOWED_ORIGINS to production domains
2. Change JWT_SECRET to a strong random string
3. Disable PHP error display (set display_errors = 0)
4. Use HTTPS for all connections
5. Implement proper authentication/authorization
6. Add rate limiting for API endpoints
7. Implement proper logging and monitoring

## Support Files

- `backend/database/db_laundry_system.sql` - Database schema
- `frontend/.env` - Frontend environment variables
- `backend/config/constants.php` - Backend configuration
- `frontend/src/app/services/api.ts` - Centralized API service
- `frontend/src/app/components/AuthContext.tsx` - Auth management

---

**Last Updated**: May 27, 2026  
**Project**: Mr. Laba-Laba Laundry Service  
**Status**: ✅ Production Ready for Local Development
