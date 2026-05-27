<?php
/**
 * DELETE ORDER API ENDPOINT
 * 
 * DELETE /api/orders/{id}
 * 
 * Deletes an order
 * Admin only
 * Will also delete associated notifications
 * 
 * @category API
 * @subpackage Orders
 */

// Include required files
require_once(__DIR__ . '/../middleware/Response.php');
require_once(__DIR__ . '/../middleware/Auth.php');
require_once(__DIR__ . '/../middleware/Validator.php');
require_once(__DIR__ . '/../config/Database.php');
require_once(__DIR__ . '/../config/constants.php');

// Check request method
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    Response::methodNotAllowed('Only DELETE request is allowed');
}

// Require admin authentication
$currentUser = Auth::requireAdmin();

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

    // Delete order (cascade will handle related records)
    $result = $db->execute(
        "DELETE FROM orders WHERE id = ?",
        [$orderId],
        "i"
    );

    if (!$result) {
        throw new Exception('Failed to delete order');
    }

    // Return success response
    Response::success(['id' => $orderId], 'Order deleted successfully');

} catch (Exception $e) {
    error_log('Delete Order Error: ' . $e->getMessage());
    Response::serverError('An error occurred while deleting the order');
}



