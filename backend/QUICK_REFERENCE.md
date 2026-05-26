# ⚡ QUICK REFERENCE GUIDE

Quick lookup for common tasks and commands.

## 🚀 30-Second Setup

```bash
# 1. Create database
mysql -u root -p < backend/database/db_laundry_system.sql

# 2. Start development
npm run dev  # Terminal 1 - Frontend (port 5173)
# Backend already running at: http://localhost/jenjen-po-main/backend

# 3. Test API
curl http://localhost/jenjen-po-main/backend/
```

## 🔑 Demo Credentials

```
Customer:
  Email: customer@demo.com
  Password: password123

Admin:
  Email: admin@demo.com
  Password: admin123
```

## 📋 Most Important Files

| File | Purpose | Edit? |
|------|---------|-------|
| `config/constants.php` | Settings & configuration | ✏️ YES |
| `database/db_laundry_system.sql` | Database schema | 📖 Read-only |
| `index.php` | API router | 📖 Read-only |
| `.htaccess` | URL rewriting | ✏️ Maybe (path) |
| `SETUP_GUIDE.md` | Setup instructions | 📖 Read-only |
| `INTEGRATION_GUIDE.md` | Frontend integration | 📖 Read-only |

## 🔧 Configuration Checklist

```
□ Database Host: localhost
□ Database User: root
□ Database Password: (empty or your password)
□ Database Name: laundry_system
□ Frontend URL: http://localhost:5173
□ JWT Secret: Changed to random string? (production)
□ Base Path in .htaccess: /jenjen-po-main/backend
```

## 🧪 Testing Endpoints

### Login
```bash
curl -X POST http://localhost/jenjen-po-main/backend/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@demo.com","password":"password123"}'
```

### Create Order
```bash
curl -X POST http://localhost/jenjen-po-main/backend/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "customer_name":"John","contact_number":"09123456789",
    "laundry_type":"wash-fold","weight":5,"special_instructions":"Gentle"
  }'
```

### Create Booking
```bash
curl -X POST http://localhost/jenjen-po-main/backend/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "booking_date":"2024-05-27","booking_time":"10:00 AM",
    "service_type":"dropoff"
  }'
```

### List Orders
```bash
curl http://localhost/jenjen-po-main/backend/api/orders?page=1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📱 Frontend API Service Setup

```typescript
// Create: src/services/api.ts

const API_BASE_URL = 'http://localhost/jenjen-po-main/backend';

async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    }
  });
  
  return response.json();
}

export const authAPI = {
  login: (email, password) => apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  // ... more methods
};
```

## 🔐 Common Security Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | Missing/invalid token | Verify token in header |
| 403 Forbidden | Insufficient permissions | Use correct user role |
| 404 Not Found | Wrong URL or file missing | Check endpoint path |
| CORS Error | Origin not allowed | Add to ALLOWED_ORIGINS |
| Database Error | Wrong credentials | Check constants.php |
| Mod_rewrite fails | Not enabled or wrong path | Check .htaccess path |

## 📚 Documentation Map

```
START HERE → README.md (overview)
          ↓
Need to setup? → SETUP_GUIDE.md (installation)
          ↓
Connecting frontend? → INTEGRATION_GUIDE.md (code examples)
          ↓
API details? → API_DOCUMENTATION.md (all endpoints)
          ↓
Implementation done? → IMPLEMENTATION_SUMMARY.md (what's been built)
```

## 🎬 API Workflow

```
1. User registers/logs in
   POST /api/auth/signup or /api/auth/login
   ↓
2. Get JWT token from response
   Store in localStorage: 'authToken'
   ↓
3. Send token in Authorization header
   Authorization: Bearer {token}
   ↓
4. Create/read/update orders
   POST/GET/PUT /api/orders
   ↓
5. Create/read bookings
   POST/GET /api/bookings
   ↓
All data persisted in MySQL database!
```

## 🛠️ Useful Commands

```bash
# Check MySQL is running
mysql -u root -p -e "SELECT 1;"

# View database
mysql -u root -p laundry_system -e "SHOW TABLES;"

# View users
mysql -u root -p laundry_system -e "SELECT * FROM users;"

# Check Apache mod_rewrite
apache2ctl -M | grep rewrite  # Linux
apachectl -M | grep rewrite   # macOS

# Clear browser cache
Ctrl+Shift+Delete (Windows/Linux)
Cmd+Shift+Delete (macOS)
```

## 📊 Valid Values

### Laundry Types
- `wash-fold`
- `dry-clean`
- `express`
- `delicate`

### Order Statuses
- `Received`
- `Washing`
- `Drying`
- `Folding`
- `Ready for Pickup`

### Time Slots
- 08:00 AM through 06:00 PM (1-hour intervals)

### Service Types
- `pickup`
- `dropoff`

### Booking Status
- `pending`
- `accepted`
- `rejected`

## 🔄 Frontend Integration Steps

1. Create `src/services/api.ts` with API calls
2. Update `AuthContext.tsx` to use backend
3. Update `LoginPage.tsx` - call `/api/auth/login`
4. Update `SignupPage.tsx` - call `/api/auth/signup`
5. Update `OrderPage.tsx` - call `/api/orders` POST
6. Update `SchedulePage.tsx` - call `/api/bookings` POST
7. Update `CustomerDashboard.tsx` - fetch from `/api/orders`
8. Update `AdminDashboard.tsx` - fetch stats
9. Update `AdminOrderManagement.tsx` - manage orders via API
10. Update `AdminScheduleManagement.tsx` - manage bookings via API

See **INTEGRATION_GUIDE.md** for detailed code.

## ❌ Common Mistakes to Avoid

- ❌ Forgetting `Authorization: Bearer` header
- ❌ Wrong endpoint paths (/api vs /backend/api)
- ❌ Not storing JWT token after login
- ❌ Using old localStorage data instead of API
- ❌ Wrong Content-Type header
- ❌ Forgetting to handle async/await in fetch
- ❌ Not validating dates (must be future date)
- ❌ Changing JWT_SECRET on existing tokens
- ❌ Using admin endpoints with customer token
- ❌ Missing database import

## 💾 Backup Commands

```bash
# Backup database
mysqldump -u root -p laundry_system > backup.sql

# Restore database
mysql -u root -p laundry_system < backup.sql

# Backup files
tar -czf backend_backup.tar.gz backend/
```

## 📈 Monitoring & Logs

```
Frontend logs: Browser Console (F12)
Backend logs: /logs/app.log (if enabled)
Database errors: Check phpMyAdmin
Apache errors: /var/log/apache2/error.log (Linux)
```

## 🎯 Success Checklist

- [ ] Database created and populated
- [ ] Backend running at http://localhost/jenjen-po-main/backend
- [ ] API info endpoint returns data
- [ ] Login endpoint works (returns token)
- [ ] Can create order with valid token
- [ ] Can create booking with valid token
- [ ] Frontend can fetch from backend
- [ ] JWT token stored in localStorage
- [ ] Orders/bookings display from database
- [ ] All CRUD operations working

## 🚨 Emergency Commands

```bash
# Restart Apache (Linux)
sudo service apache2 restart

# Restart Apache (macOS)
sudo apachectl restart

# Reset database to base state
mysql -u root -p laundry_system < database/db_laundry_system.sql

# Clear Laravel cache (if using)
php artisan cache:clear

# Check file permissions
ls -la backend/

# Fix permissions for uploads
chmod 755 backend/uploads/
chmod 644 backend/uploads/*
```

## 💡 Pro Tips

1. Use Postman to test endpoints before frontend integration
2. Always check Network tab when debugging
3. Console.log JWT token to verify it's stored
4. Test with demo accounts first
5. Use different browser tabs for customer vs admin testing
6. Check database directly in phpMyAdmin during testing
7. Keep backend running while developing frontend
8. Save JWT token in Postman environment variable
9. Test pagination with different page numbers
10. Check all validation errors in response

## 🔗 Quick Links

- API Base: http://localhost/jenjen-po-main/backend
- phpMyAdmin: http://localhost/phpmyadmin
- Frontend: http://localhost:5173
- Documentation: `/backend/README.md`
- Setup Guide: `/backend/SETUP_GUIDE.md`
- Integration: `/backend/INTEGRATION_GUIDE.md`
- API Docs: `/backend/API_DOCUMENTATION.md`

---

**Last Updated:** May 26, 2024
**Version:** 1.0.0
