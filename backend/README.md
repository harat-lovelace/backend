# 🧺 Laundry Management System - Backend API

Professional PHP/MySQL REST API for the Mr. Laba-Laba Laundry Service System.

## 🌟 Features

- ✅ User Authentication (Signup, Login, Logout)
- ✅ JWT Token-based Security
- ✅ Role-based Access Control (Customer, Admin)
- ✅ Complete Order Management (CRUD)
- ✅ Appointment Booking System
- ✅ Search and Filtering
- ✅ Pagination Support
- ✅ Input Validation
- ✅ Error Handling
- ✅ CORS Support
- ✅ SQL Injection Prevention (Prepared Statements)
- ✅ Password Hashing (bcrypt)
- ✅ Comprehensive API Documentation

## 🚀 Quick Start

### Prerequisites
- PHP 7.4+
- MySQL 5.7+
- Apache 2.4+ (with mod_rewrite)
- XAMPP or Laragon

### Installation

1. **Setup Database**
   ```bash
   mysql -u root -p < database/db_laundry_system.sql
   ```

2. **Configure Settings**
   - Edit `config/constants.php`
   - Update database credentials
   - Change JWT_SECRET for production

3. **Start Backend**
   - Backend runs at: `http://localhost/jenjen-po-main/backend`

4. **Test API**
   ```bash
   curl http://localhost/jenjen-po-main/backend/
   ```

## 📚 API Documentation

See [API_ENDPOINTS.md](API_ENDPOINTS.md) for detailed endpoint documentation.

### Quick Examples

#### Register User
```javascript
fetch('http://localhost/jenjen-po-main/backend/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    full_name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    confirm_password: 'password123'
  })
})
```

#### Login
```javascript
fetch('http://localhost/jenjen-po-main/backend/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  })
})
```

#### Create Order
```javascript
fetch('http://localhost/jenjen-po-main/backend/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    customer_name: 'John Doe',
    contact_number: '09123456789',
    laundry_type: 'wash-fold',
    weight: 5.0,
    special_instructions: 'Gentle care'
  })
})
```

## 📁 Project Structure

```
backend/
├── api/                          # API endpoints
│   ├── auth/                     # Authentication endpoints
│   │   ├── signup.php
│   │   ├── login.php
│   │   └── me.php
│   ├── orders/                   # Order management endpoints
│   │   ├── create.php
│   │   ├── list.php
│   │   ├── get.php
│   │   ├── update.php
│   │   ├── delete.php
│   │   └── search.php
│   └── bookings/                 # Booking endpoints
│       ├── create.php
│       ├── list.php
│       ├── get.php
│       ├── update.php
│       ├── delete.php
│       └── availability.php
├── config/                       # Configuration files
│   ├── constants.php             # App constants and settings
│   └── Database.php              # Database connection class
├── middleware/                   # Middleware classes
│   ├── Auth.php                  # JWT authentication
│   ├── Response.php              # Standardized responses
│   └── Validator.php             # Input validation
├── database/                     # Database files
│   └── db_laundry_system.sql     # Database schema
├── uploads/                      # File uploads directory
├── helpers/                      # Helper functions
│   └── functions.php
├── index.php                     # Main router
├── init.php                      # Initialization file
├── .htaccess                     # Apache rewrite rules
├── SETUP_GUIDE.md                # Setup instructions
├── INTEGRATION_GUIDE.md          # Frontend integration
├── API_DOCUMENTATION.md          # API docs
└── README.md                     # This file
```

## 🔐 Security Features

- **Password Hashing**: bcrypt algorithm
- **SQL Injection Prevention**: Prepared statements
- **CSRF Protection**: Built-in request validation
- **CORS Security**: Configurable allowed origins
- **JWT Authentication**: Secure token-based auth
- **Input Sanitization**: All inputs validated and sanitized
- **Error Handling**: No sensitive info in error messages
- **HTTP Headers**: Security headers included

## 📖 Documentation

- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Complete setup instructions
- [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) - Frontend integration guide
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Detailed API docs

## 🧪 Testing

### Test with cURL

```bash
# Health check
curl http://localhost/jenjen-po-main/backend/

# Register
curl -X POST http://localhost/jenjen-po-main/backend/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test","email":"test@test.com","password":"password123","confirm_password":"password123"}'

# Login
curl -X POST http://localhost/jenjen-po-main/backend/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

### Test with Postman

1. Download Postman: https://www.postman.com/downloads/
2. Create a new request collection
3. Import endpoints from API documentation
4. Set up variables for base URL and token
5. Test each endpoint

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| 404 errors | Check `.htaccess` and mod_rewrite is enabled |
| Database errors | Verify credentials in `config/constants.php` |
| CORS errors | Add frontend URL to ALLOWED_ORIGINS |
| Auth errors | Verify JWT token format and expiration |

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed troubleshooting.

## 👥 Demo Accounts

After database setup, use these credentials:

**Customer**
- Email: customer@demo.com
- Password: password123

**Admin**
- Email: admin@demo.com
- Password: admin123

## 📝 Demo Data

The database includes sample data:
- 2 users (customer and admin)
- 3 sample orders
- 2 sample bookings

## 🌍 Environment Configuration

Create `.env` file (if needed) or set variables in `config/constants.php`:

```php
// Database
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=laundry_system

// API
API_URL=http://localhost/jenjen-po-main/backend
FRONTEND_URL=http://localhost:5173

// Security
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=604800 // 7 days in seconds

// File Upload
MAX_UPLOAD_SIZE=5242880 // 5MB in bytes

// CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

## 🚀 Deployment

### Before Production

1. Change JWT_SECRET to a strong random string
2. Update database credentials
3. Set `display_errors` to 0
4. Enable HTTPS
5. Configure proper CORS origins
6. Set up proper file permissions
7. Enable error logging
8. Test all endpoints thoroughly

### Production Deployment

1. Use environment-specific config
2. Enable HTTPS/SSL
3. Set up automated backups
4. Monitor error logs
5. Implement rate limiting
6. Use strong database password
7. Keep PHP and MySQL updated

## 📊 Database Schema

### Users Table
```sql
- id: Primary key
- email: Unique email (for authentication)
- password: Hashed password
- full_name: User's full name
- role: 'customer' or 'admin'
- phone_number: Contact number
- created_at: Timestamp
```

### Orders Table
```sql
- id: Primary key
- order_code: Unique order identifier (LDY-XXXX)
- user_id: Foreign key to users
- customer_name: Customer name
- contact_number: Phone number
- laundry_type: Service type
- weight: Laundry weight in kg
- status: Current order status
- estimated_pickup: Expected pickup date
- created_at: Timestamp
```

### Bookings Table
```sql
- id: Primary key
- user_id: Foreign key to users
- booking_date: Appointment date
- booking_time: Appointment time slot
- service_type: 'pickup' or 'dropoff'
- status: 'pending', 'accepted', or 'rejected'
- created_at: Timestamp
```

## 🤝 Contributing

When contributing:
1. Follow the existing code style
2. Add proper comments and documentation
3. Test all changes
4. Update relevant documentation
5. Follow security best practices

## 📞 Support

For issues or questions:
1. Check documentation files
2. Review error messages
3. Check debug logs
4. Test with Postman
5. Verify database setup

## 📄 License

This project is part of the Mr. Laba-Laba Laundry Service System.

## 🎉 Credits

Built with:
- PHP 7.4+
- MySQL 8.0
- Apache 2.4
- JWT for authentication
- bcrypt for password hashing

---

## 📊 Development Status

- ✅ Authentication System
- ✅ Order Management
- ✅ Booking System
- ✅ User Management
- ✅ Admin Dashboard
- ✅ API Documentation
- ✅ Setup Guides
- ⬜ Payment Integration (Future)
- ⬜ Email Notifications (Future)
- ⬜ SMS Integration (Future)

---

**Happy Coding! 🚀**
