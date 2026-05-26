<?php
/**
 * CONFIGURATION FILE
 * 
 * This file contains all constants and configuration settings
 * for the laundry management system backend.
 * 
 * @category Configuration
 * @package LaundrySystem
 */

// ==============================================================
// DATABASE CONFIGURATION
// ==============================================================

// Database connection details
define('DB_HOST', 'localhost');          // Database host (usually localhost for local development)
define('DB_USER', 'root');               // Database username
define('DB_PASS', '');                   // Database password (empty for local XAMPP/Laragon)
define('DB_NAME', 'laundry_system');     // Database name

// ==============================================================
// APPLICATION CONFIGURATION
// ==============================================================

// Application base URL
define('APP_URL', 'http://localhost/jenjen-po-main/backend');

// Frontend application URL
define('FRONTEND_URL', 'http://localhost:5173');

// ==============================================================
// SECURITY CONFIGURATION
// ==============================================================

// JWT Secret key (change this to a strong random string in production)
define('JWT_SECRET', 'your-super-secret-key-change-this-in-production-12345');

// JWT Token expiration time (in seconds)
define('JWT_EXPIRATION', 86400 * 7);  // 7 days

// Password hashing algorithm
define('PASSWORD_ALGO', PASSWORD_BCRYPT);

// ==============================================================
// FILE UPLOAD CONFIGURATION
// ==============================================================

// Maximum file upload size (in bytes) - 5MB
define('MAX_UPLOAD_SIZE', 5 * 1024 * 1024);

// Allowed file types for uploads
define('ALLOWED_FILE_TYPES', ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']);

// Upload directory path
define('UPLOAD_DIR', __DIR__ . '/../uploads/');

// ==============================================================
// BUSINESS LOGIC CONSTANTS
// ==============================================================

// Laundry service types
define('LAUNDRY_TYPES', [
    'wash-fold' => 'Wash & Fold',
    'dry-clean' => 'Dry Clean',
    'express' => 'Express',
    'delicate' => 'Delicate Items'
]);

// Service statuses
define('ORDER_STATUSES', [
    'Received' => 'Received',
    'Washing' => 'Washing',
    'Drying' => 'Drying',
    'Folding' => 'Folding',
    'Ready for Pickup' => 'Ready for Pickup'
]);

// Available booking time slots (in 1-hour intervals, 8 AM to 6 PM)
define('BOOKING_TIME_SLOTS', [
    '08:00 AM',
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
    '06:00 PM'
]);

// Maximum booking slots per time slot
define('MAX_SLOTS_PER_TIME', 3);

// Booking availability window (in days from today)
define('BOOKING_WINDOW_DAYS', 30);

// Default estimated pickup days
define('DEFAULT_PICKUP_DAYS', 3);

// ==============================================================
// ERROR HANDLING CONFIGURATION
// ==============================================================

// Error reporting level
error_reporting(E_ALL);
ini_set('display_errors', 1);  // Set to 0 in production

// ==============================================================
// CORS CONFIGURATION
// ==============================================================

// Allowed origins for CORS
define('ALLOWED_ORIGINS', [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost',
    'http://127.0.0.1'
]);

// Allowed HTTP methods
define('ALLOWED_METHODS', 'GET, POST, PUT, DELETE, OPTIONS');

// Allowed headers
define('ALLOWED_HEADERS', 'Content-Type, Authorization, X-Requested-With');

// ==============================================================
// PAGINATION CONFIGURATION
// ==============================================================

// Default items per page
define('ITEMS_PER_PAGE', 10);

// ==============================================================
// EMAIL CONFIGURATION (For future use)
// ==============================================================

// SMTP Server (if needed for notifications)
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'your-email@gmail.com');
define('SMTP_PASS', 'your-email-password');

// From email address
define('FROM_EMAIL', 'no-reply@laundry-system.local');

// ==============================================================
// DATE/TIME CONFIGURATION
// ==============================================================

// Timezone
date_default_timezone_set('Asia/Manila');  // Change to your timezone

// Date format
define('DATE_FORMAT', 'Y-m-d');
define('DATETIME_FORMAT', 'Y-m-d H:i:s');
