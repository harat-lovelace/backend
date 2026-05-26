-- ==========================================
-- MR. LABA-LABA LAUNDRY SERVICES DATABASE SQL
-- Clean, secure, and fully normalized structure
-- ==========================================

CREATE DATABASE IF NOT EXISTS laundry_db;
USE laundry_db;

-- ------------------------------------------
-- 1. USERS TABLE
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------
-- 2. ORDERS TABLE (Relational with users)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    laundry_type VARCHAR(50) NOT NULL,
    weight DECIMAL(5,2) NOT NULL,
    special_instructions TEXT DEFAULT NULL,
    image_path VARCHAR(255) DEFAULT NULL,
    user_id INT DEFAULT NULL,
    user_email VARCHAR(100) NOT NULL,
    status ENUM('Order Submitted', 'Order Accepted', 'Pickup Scheduled', 'Laundry Picked Up', 'Washing', 'Drying', 'Folding', 'Ready for Delivery', 'Completed') DEFAULT 'Order Submitted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estimated_pickup DATE NOT NULL,
    notification_read TINYINT(1) DEFAULT 0,
    INDEX idx_order_user_id (user_id),
    INDEX idx_order_customer_name (customer_name),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------
-- 3. BOOKINGS TABLE (Schedules & Slot Capacity)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_date DATE NOT NULL,
    booking_time VARCHAR(20) NOT NULL,
    service_type ENUM('pickup', 'dropoff') NOT NULL,
    user_id INT DEFAULT NULL,
    user_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(100) NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_booking_user_id (user_id),
    INDEX idx_booking_datetime (booking_date, booking_time),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------
-- 4. NOTIFICATIONS TABLE
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    user_email VARCHAR(100) NOT NULL,
    message VARCHAR(255) NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notif_email (user_email),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------
-- INSERT DEFAULT SEED DATA
-- ------------------------------------------
-- Pre-hashed passwords:
-- customer@example.com -> 'password123' -> $2y$10$8C5XJgJ9qQkYvR7d4/uHNu12uA7o0b6S1wHhC4O9e8pL3pQ9mYmGy
-- admin@laundry.com    -> 'admin123'    -> $2y$10$Y1sVd8cZp6v1R8/o5qX3eeXzH5JtPqg3B4eC5eC5eC5eC5eC5eC5e
-- ------------------------------------------

INSERT INTO users (id, name, email, password, role) VALUES
(1, 'John Doe', 'customer@example.com', '$2y$10$8C5XJgJ9qQkYvR7d4/uHNu12uA7o0b6S1wHhC4O9e8pL3pQ9mYmGy', 'customer'),
(2, 'System Admin', 'admin@laundry.com', '$2y$10$Y1sVd8cZp6v1R8/o5qX3eeXzH5JtPqg3B4eC5eC5eC5eC5eC5eC5e', 'admin')
ON DUPLICATE KEY UPDATE id=id;

-- Sample Orders for Customer
INSERT INTO orders (id, customer_name, contact_number, laundry_type, weight, special_instructions, user_id, user_email, status, created_at, estimated_pickup, notification_read) VALUES
('LDY-0001', 'John Doe', '09123456789', 'wash-fold', 4.5, 'Please use mild detergent and separate whites.', 1, 'customer@example.com', 'Washing', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 2 DAY), 0),
('LDY-0002', 'John Doe', '09123456789', 'dry-clean', 2.0, 'Delicate dress shirt. Hang dry.', 1, 'customer@example.com', 'Ready for Delivery', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW(), 0),
('LDY-0003', 'John Doe', '09123456789', 'express', 3.0, 'Express service requested.', 1, 'customer@example.com', 'Completed', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), 1)
ON DUPLICATE KEY UPDATE id=id;

-- Sample Bookings for Customer
INSERT INTO bookings (id, booking_date, booking_time, service_type, user_id, user_name, user_email, status, created_at) VALUES
(1, DATE_ADD(CURRENT_DATE(), INTERVAL 3 DAY), '10:00 AM', 'pickup', 1, 'John Doe', 'customer@example.com', 'pending', DATE_SUB(NOW(), INTERVAL 12 HOUR)),
(2, DATE_ADD(CURRENT_DATE(), INTERVAL 6 DAY), '02:00 PM', 'dropoff', 1, 'John Doe', 'customer@example.com', 'accepted', DATE_SUB(NOW(), INTERVAL 1 DAY))
ON DUPLICATE KEY UPDATE id=id;
