<?php
/**
 * GET SINGLE ORDER API ENDPOINT
 * 
 * GET /api/orders/{id}
 * 
 * Retrieves a single order by ID
 * Customers can only view their own orders
 * Admins can view any order
 * 
 * @category API
 * @subpackage Orders
 */

// Bootstrap application
require_once(__DIR__ . '/../../init.php');

// Check request method
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::methodNotAllowed('Only GET request is allowed');
}

// Require authentication
$currentUser = Auth::requireAuth();

// Get order ID from URL
$orderId = isset($_GET['id']) ? Validator::sanitizeInt($_GET['id']) : 0;

if ($orderId <= 0) {
    Response::validationError(['id' => 'Order ID is required']);
}

try {
    // Initialize database
    $db = new Database();

    // Get order
    $order = $db->getRow(
        "SELECT * FROM orders WHERE id = ?",
        [$orderId],
        "i"
    );

    if (!$order) {
        Response::notFound('Order not found');
    }

    // Check authorization (customers can only view their own orders)
    if (Auth::isCustomer($currentUser) && $order['user_id'] != $currentUser['id']) {
        Response::forbidden('You do not have permission to view this order');
    }

    // Return order
    Response::success($order, 'Order retrieved successfully');

} catch (Exception $e) {
    error_log('Get Order Error: ' . $e->getMessage());
    Response::serverError('An error occurred while retrieving the order');
}



