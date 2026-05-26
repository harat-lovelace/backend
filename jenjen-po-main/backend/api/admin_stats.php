<?php
/**
 * Admin Statistics API Endpoint
 * Computes dashboard counts for total orders, active orders, ready orders, and customer count
 */

// Load global configuration and database connection
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // 1. Count Total Orders
    $q_total = "SELECT COUNT(*) FROM orders";
    $stmt_total = $db->query($q_total);
    $total_orders = intval($stmt_total->fetchColumn());
    
    // 2. Count Active Orders (In Progress - status not Ready for Pickup)
    $q_active = "SELECT COUNT(*) FROM orders WHERE status != 'Ready for Pickup'";
    $stmt_active = $db->query($q_active);
    $in_progress = intval($stmt_active->fetchColumn());
    
    // 3. Count Ready for Pickup Orders
    $q_ready = "SELECT COUNT(*) FROM orders WHERE status = 'Ready for Pickup'";
    $stmt_ready = $db->query($q_ready);
    $ready_pickup = intval($stmt_ready->fetchColumn());
    
    // 4. Count Unique Customers
    $q_customers = "SELECT COUNT(*) FROM users WHERE role = 'customer'";
    $stmt_customers = $db->query($q_customers);
    $customers_count = intval($stmt_customers->fetchColumn());
    
    // Compile and return summary data payload
    $stats = [
        "totalOrders" => $total_orders,
        "inProgress" => $in_progress,
        "readyForPickup" => $ready_pickup,
        "customersCount" => $customers_count
    ];
    
    sendResponse(true, $stats, "Admin overview statistics calculated successfully.");
    
} catch (PDOException $e) {
    error_log("GET admin statistics failure: " . $e->getMessage());
    sendResponse(false, null, "Failed to calculate admin stats.", 500);
}
?>
