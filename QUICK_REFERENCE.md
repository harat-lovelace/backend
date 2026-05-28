# Quick Reference - Mr. Laba-Laba Setup

## ⚡ Quick Start (3 Steps)

### 1. Ensure Laragon is Running
```
✅ Apache running (green in Laragon)
✅ MySQL running (green in Laragon)  
✅ Database "laundry_system" imported
```

### 2. Start Frontend
```bash
cd frontend
npm install      # First time only
npm run dev      # Starts at localhost:5173
```

### 3. Open Browser
```
http://localhost:5173
```

---

## 📍 ALL FINAL URLs

### Frontend
- Landing: `http://localhost:5173/`
- Signup: `http://localhost:5173/signup`
- Login: `http://localhost:5173/login`
- Dashboard: `http://localhost:5173/dashboard`
- Admin: `http://localhost:5173/admin`

### Backend API Base
```
http://localhost/jenjen-po-main/backend
```

### API Endpoints

**✅ SIGNUP** (Create Account)
```
POST /auth/signup
{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "password123",
  "role": "customer"  // or "admin"
}
```

**✅ LOGIN** (User Auth)
```
POST /auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

**✅ HEALTH CHECK** (Verify Backend)
```
GET /health
Response: { "success": true, "status": "healthy" }
```

**✅ ORDERS** (Laundry Orders)
```
GET /orders                    # List all
POST /orders                   # Create new
GET /orders?id={id}           # Get single
PUT /orders?id={id}           # Update
DELETE /orders?id={id}        # Delete
GET /orders?q={search}        # Search
```

**✅ BOOKINGS** (Schedule Pickups)
```
GET /bookings                          # List all
POST /bookings                         # Create new
GET /bookings?id={id}                 # Get single
PUT /bookings?id={id}                 # Update
DELETE /bookings?id={id}              # Delete
GET /bookings?date={YYYY-MM-DD}       # Check availability
```

**✅ OTHERS**
```
GET /notifications            # Get notifs
POST /notifications           # Update notifs
POST /profile                 # Update profile
GET /auth/me                  # Current user
POST /auth/logout             # Logout
```

---

## 📝 Files Changed

### Frontend

#### 1. **frontend/.env** (NEW)
```env
VITE_API_URL=http://localhost/jenjen-po-main/backend
```

#### 2. **frontend/.env.local** (NEW)
```env
VITE_API_URL=http://localhost/jenjen-po-main/backend
```

#### 3. **frontend/src/app/apiConfig.ts** (UPDATED)
```typescript
// OLD: 'http://localhost:8000/api'
// NEW: Uses import.meta.env.VITE_API_URL pointing to Laragon
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/jenjen-po-main/backend';
```

#### 4. **frontend/vite.config.ts** (UPDATED)
```typescript
// Added server config with proxy:
server: {
  port: 5173,
  cors: true,
  proxy: {
    '/api': {
      target: 'http://localhost',
      changeOrigin: true,
      pathRewrite: { '^/api': '/jenjen-po-main/backend' }
    }
  }
}
```

#### 5. **frontend/src/app/services/api.ts** (NEW)
- Centralized API service
- All async API calls go through this
- Automatic error handling
- JWT token management
- Proper CORS headers

#### 6. **frontend/src/app/components/AuthContext.tsx** (UPDATED)
```typescript
// OLD: Direct fetch calls + API_BASE_URL
// NEW: Uses apiPost, apiGet from services/api.ts
  const login = async (email, password) => {
    const result = await apiPost('/auth/login', { email, password });
    // ...
  }
```

#### 7. **All Component Updates:**
- AdminDashboard.tsx
- AdminOrderManagement.tsx  
- AdminScheduleManagement.tsx
- CustomerDashboard.tsx
- Navigation.tsx
- OrderPage.tsx
- SchedulePage.tsx
- TrackingPage.tsx

Changes:
- ❌ Removed: `import { API_BASE_URL } from '../apiConfig'`
- ✅ Added: `import { apiGet, apiPost, apiPut, apiDelete } from '../services/api'`
- ❌ Removed: Direct `fetch()` calls or endpoint .php files
- ✅ Added: `apiGet('/endpoint')`, `apiPost('/endpoint', data)`, etc.

### Backend

#### 1. **backend/routes/api.php** (UPDATED)
```php
// Added handling for direct endpoint routing (without /api prefix)
// Added 'health' endpoint case
if ($version === 'api') {
  // ... existing logic
} else {
  // New: Direct endpoint routing
  $endpoint = $version;  // First segment is endpoint
}
```

#### 2. **backend/controllers/health.php** (NEW)
- Health check endpoint
- Returns: `{ "success": true, "status": "healthy", "database": "connected" }`
- Used to verify backend is running

#### 3. **backend/controllers/auth/signup.php** (UPDATED)
```php
// Added support for 'name' AND 'full_name' fields
$fullName = isset($input['name']) ? ... : isset($input['full_name']) ? ...

// Added support for 'role' from frontend
$role = isset($input['role']) ? ... : 'customer'

// Updated INSERT to use $role variable
// Updated response to include both 'name' and 'full_name'
```

#### 4. **backend/controllers/auth/login.php** (UPDATED)
```php
// Updated response to include 'name' field (from 'full_name')
"name" => $user['full_name'],
"full_name" => $user['full_name'],
```

---

## 🔄 Request/Response Flow

### Example: Signup Flow

**1. Frontend Call:**
```javascript
const result = await signup('John', 'john@example.com', 'pass123', 'customer')
```

**2. AuthContext → API Service:**
```javascript
apiPost('/auth/signup', { name: 'John', email: '...', password: '...', role: 'customer' })
```

**3. API Service builds URL:**
```
http://localhost/jenjen-po-main/backend/auth/signup
```

**4. Backend Router parses:**
```
Path: /auth/signup
endpoint = 'auth'
method = 'signup'
→ Calls controllers/auth/signup.php
```

**5. Backend Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "email": "john@example.com",
    "name": "John",
    "role": "customer",
    "token": "eyJhbGc..."
  }
}
```

**6. Frontend stores user & redirects to dashboard**

---

## ✅ Verification Commands

```bash
# Check backend health from terminal:
curl http://localhost/jenjen-po-main/backend/health

# Check from browser:
http://localhost/jenjen-po-main/backend/health

# Expected: 
# { "success": true, "status": "healthy" }
```

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Unable to connect to backend" | Check Apache running + `/health` endpoint works |
| CORS errors in console | Apache must be running + route /jenjen-po-main/backend must exist |
| Database errors | Import db_laundry_system.sql + laundry_system database must exist |
| Port 5173 already in use | Change frontend port in vite.config.ts or kill process on 5173 |
| 404 on /api/auth/signup | Router now maps `/auth/signup` directly (no /api prefix needed) |

---

## 📊 Architecture Summary

```
┌─ LARAGON (Windows) ─────────────────────────────┐
│                                                  │
│  Apache/htdocs/                                 │
│  └── jenjen-po-main/                           │
│      ├── frontend/  (React + Vite)             │
│      │   ├── src/app/services/api.ts           │
│      │   └── vite dev server @ :5173           │
│      │                                          │
│      └── backend/  (PHP)                       │
│          ├── routes/api.php                    │
│          ├── controllers/auth/...              │
│          ├── controllers/orders/...            │
│          │ MySQL (localhost:3306)              │
│          │ Database: laundry_system            │
│          └── @ http://localhost/jenjen-po-main/backend
│
└──────────────────────────────────────────────────┘
```

---

## 🚀 Production Checklist

- [ ] Update ALLOWED_ORIGINS in backend/config/constants.php
- [ ] Change JWT_SECRET to strong random string
- [ ] Set display_errors = 0 in php.ini
- [ ] Use HTTPS for all URLs
- [ ] Implement rate limiting
- [ ] Add comprehensive logging
- [ ] Test all endpoints with curl/Postman
- [ ] Document API responses for frontend team

---

**Status**: ✅ Fully Configured & Ready to Use  
**Last Update**: May 27, 2026
