<?php
/**
 * Database Migration & Init Script
 * Creates the database, imports the base schema, and applies the production updates.
 */

echo "Starting database migration...\n";

$host = '127.0.0.1';
$username = 'root';
$password = '';
$db_name = 'laundry_db';

try {
    // 1. Connect without dbname to ensure we can create it
    echo "Connecting to MySQL server at $host...\n";
    $dsn = "mysql:host=$host;charset=utf8mb4";
    $db = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
    ]);

    // 2. Read and execute laundry_db.sql to create database and seed base data
    $sql_file = __DIR__ . '/laundry_db.sql';
    if (!file_exists($sql_file)) {
        throw new Exception("Base database seed file laundry_db.sql not found at: $sql_file");
    }

    echo "Reading base schema from laundry_db.sql...\n";
    $sql = file_get_contents($sql_file);
    
    // Execute laundry_db.sql queries
    echo "Executing base schema initialization...\n";
    $db->exec($sql);
    echo "Base schema initialized.\n";

    // 3. Connect specifically to the created laundry_db
    $db->exec("USE `$db_name`");

    // 4. Create notifications table
    echo "Creating notifications table...\n";
    $db->exec("CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT NULL,
        user_email VARCHAR(100) NOT NULL,
        message VARCHAR(255) NOT NULL,
        is_read TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_notif_email (user_email),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // 5. Modify orders status field to VARCHAR temporary to perform updates safely
    echo "Modifying orders status field to VARCHAR...\n";
    $db->exec("ALTER TABLE orders MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'Order Submitted'");

    // 6. Update existing statuses from old enum values to new ones
    echo "Updating existing order statuses...\n";
    $db->exec("UPDATE orders SET status = 'Order Submitted' WHERE status = 'Received'");
    $db->exec("UPDATE orders SET status = 'Ready for Delivery' WHERE status = 'Ready for Pickup'");
    
    // Ensure all rows contain a valid status before converting to enum
    $db->exec("UPDATE orders SET status = 'Order Submitted' WHERE status NOT IN (
        'Order Submitted', 
        'Order Accepted', 
        'Pickup Scheduled', 
        'Laundry Picked Up', 
        'Washing', 
        'Drying', 
        'Folding', 
        'Ready for Delivery', 
        'Completed'
    )");

    // 7. Alter orders status field back to the new enum
    echo "Modifying orders status field to the new ENUM...\n";
    $db->exec("ALTER TABLE orders MODIFY COLUMN status ENUM(
        'Order Submitted', 
        'Order Accepted', 
        'Pickup Scheduled', 
        'Laundry Picked Up', 
        'Washing', 
        'Drying', 
        'Folding', 
        'Ready for Delivery', 
        'Completed'
    ) NOT NULL DEFAULT 'Order Submitted'");

    // 8. Update demo user details to clean production-ready ones
    echo "Renaming demo users and updating emails...\n";
    $db->exec("UPDATE users SET email = 'customer@example.com', name = 'John Doe' WHERE email = 'customer@demo.com'");
    $db->exec("UPDATE users SET email = 'admin@laundry.com', name = 'System Admin' WHERE email = 'admin@demo.com'");
    
    // Update emails in related tables to maintain consistency
    $db->exec("UPDATE orders SET user_email = 'customer@example.com', customer_name = 'John Doe' WHERE user_email = 'customer@demo.com'");
    $db->exec("UPDATE orders SET user_email = 'admin@laundry.com' WHERE user_email = 'admin@demo.com'");
    $db->exec("UPDATE bookings SET user_email = 'customer@example.com', user_name = 'John Doe' WHERE user_email = 'customer@demo.com'");

    echo "Migration completed successfully!\n";

} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
?>
