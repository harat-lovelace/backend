-- ==============================================================
-- LAUNDRY SERVICES SYSTEM DATABASE
-- Created for Mr. Laba-Laba Laundry Service
-- ==============================================================

-- Create Database
CREATE DATABASE IF NOT EXISTS laundry_system;
USE laundry_system;

-- ==============================================================
-- USERS TABLE
-- ==============================================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    phone_number VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    KEY idx_email (email),
    KEY idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================
-- ORDERS TABLE
-- ==============================================================
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_code VARCHAR(20) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    laundry_type ENUM('wash-fold', 'dry-clean', 'express', 'delicate') DEFAULT 'wash-fold',
    weight DECIMAL(10, 2) NOT NULL,
    special_instructions TEXT,
    status ENUM(
        'Received',
        'Washing',
        'Drying',
        'Folding',
        'Ready for Pickup'
    ) DEFAULT 'Received',
    estimated_pickup DATE,
    notification_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    KEY idx_user_id (user_id),
    KEY idx_status (status),
    KEY idx_order_code (order_code),
    KEY idx_customer_name (customer_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================
-- BOOKINGS TABLE (Appointments)
-- ==============================================================
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    booking_date DATE NOT NULL,
    booking_time VARCHAR(50) NOT NULL,
    service_type ENUM('pickup', 'dropoff') DEFAULT 'dropoff',
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    KEY idx_user_id (user_id),
    KEY idx_booking_date (booking_date),
    KEY idx_status (status),
    KEY idx_date_time (booking_date, booking_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================
-- NOTIFICATIONS TABLE
-- ==============================================================
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    order_id INT,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    KEY idx_user_id (user_id),
    KEY idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================
-- AUDIT LOG TABLE
-- ==============================================================
CREATE TABLE audit_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT,
    action VARCHAR(255),
    entity_type VARCHAR(50),
    entity_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL,
    KEY idx_admin_id (admin_id),
    KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================
-- SAMPLE DATA
-- ==============================================================

-- Sample Users (Passwords are hashed with password_hash())
-- Customer: customer@demo.com / password123
-- Admin: admin@demo.com / admin123

INSERT INTO users (email, password, full_name, role, phone_number, address) VALUES
('customer@demo.com', '$2y$10$5.mknRGMnBEwWx4OxKqGh.gqe8.YX/b.XWhnKbPwXkzKT.jyRZuLC', 'Customer Demo', 'customer', '09123456789', '123 Main Street, City'),
('admin@demo.com', '$2y$10$u3AuK0nfWsP.eKx2yDJI2etHLLPvLFV9gXHDI8oQqVmwCKp.gQ1pC', 'Admin User', 'admin', '09987654321', 'Admin Office');

-- Sample Orders
INSERT INTO orders (order_code, user_id, customer_name, contact_number, laundry_type, weight, status, estimated_pickup, created_at) VALUES
('LDY-0001', 1, 'Customer Demo', '09123456789', 'wash-fold', 5.0, 'Received', DATE_ADD(CURDATE(), INTERVAL 3 DAY), NOW()),
('LDY-0002', 1, 'Customer Demo', '09123456789', 'dry-clean', 3.5, 'Washing', DATE_ADD(CURDATE(), INTERVAL 2 DAY), NOW() - INTERVAL 1 DAY),
('LDY-0003', 1, 'Customer Demo', '09123456789', 'express', 2.0, 'Ready for Pickup', CURDATE(), NOW() - INTERVAL 2 DAY);

-- Sample Bookings
INSERT INTO bookings (user_id, booking_date, booking_time, service_type, user_name, user_email, status) VALUES
(1, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '10:00 AM', 'pickup', 'Customer Demo', 'customer@demo.com', 'pending'),
(1, DATE_ADD(CURDATE(), INTERVAL 5 DAY), '02:00 PM', 'dropoff', 'Customer Demo', 'customer@demo.com', 'accepted');

-- ==============================================================
-- NOTES:
-- ==============================================================
-- Password hashes generated with: password_hash('password123', PASSWORD_BCRYPT)
-- Make sure to update hashes if you change the passwords
-- All timestamps are in UTC - adjust as needed for your timezone
-- Foreign key constraints are enabled for data integrity
-- Indexes are optimized for common queries
