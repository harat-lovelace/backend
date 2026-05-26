<?php
/**
 * UPDATE ORDER API ENDPOINT
 * 
 * PUT /api/orders/{id}
 * 
 * Updates an existing order
 * Admin only: Can update status, special instructions
 * 
 * Request Body:
 * - status: Order status (Received, Washing, Drying, Folding, Ready for Pickup)
 * - special_instructions: Special instructions for the order
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
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    Response::methodNotAllowed('Only PUT request is allowed');
}

// Require admin authentication
$currentUser = Auth::requireAdmin();

// Get order ID from URL
$orderId = isset($_GET['id']) ? Validator::sanitizeInt($_GET['id']) : 0;

if ($orderId <= 0) {
    Response::validationError(['id' => 'Order ID is required']);
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Reset validation errors
Validator::reset();

// Extract and sanitize input
$status = isset($input['status']) ? Validator::sanitizeString($input['status']) : '';
$specialInstructions = isset($input['special_instructions']) ? Validator::sanitizeString($input['special_instructions']) : '';

// Validate input
$valid = true;

if (!empty($status) && !Validator::inArray($status, array_keys(ORDER_STATUSES), 'status')) {
    $valid = false;
}

// Return validation errors if any
if (!$valid) {
    Response::validationError(Validator::getErrors());
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

    // Prepare update query
    $updateFields = [];
    $params = [];
    $types = "";

    if (!empty($status)) {
        $updateFields[] = "status = ?";
        $params[] = $status;
        $types .= "s";
    }

    if (isset($input['special_instructions'])) {
        $updateFields[] = "special_instructions = ?";
        $params[] = $specialInstructions;
        $types .= "s";
    }

    // If no fields to update, return error
    if (empty($updateFields)) {
        Response::validationError(['message' => 'No fields to update']);
    }

    // Add order ID to params
    $params[] = $orderId;
    $types .= "i";

    // Update order
    $query = "UPDATE orders SET " . implode(", ", $updateFields) . ", updated_at = NOW() WHERE id = ?";
    $result = $db->execute($query, $params, $types);

    if (!$result) {
        throw new Exception('Failed to update order');
    }

    // Get updated order
    $updatedOrder = $db->getRow(
        "SELECT * FROM orders WHERE id = ?",
        [$orderId],
        "i"
    );

    // If status is updated to "Ready for Pickup", create notification
    if (!empty($status) && $status === 'Ready for Pickup') {
        $db->execute(
            "INSERT INTO notifications (user_id, order_id, title, message, type) VALUES (?, ?, ?, ?, ?)",
            [
                $order['user_id'],
                $orderId,
                'Order Ready for Pickup',
                'Your order ' . $order['order_code'] . ' is ready for pickup!',
                'order_ready'
            ],
            "iisss"
        );
    }

    // Return success response
    Response::success($updatedOrder, 'Order updated successfully');

} catch (Exception $e) {
    error_log('Update Order Error: ' . $e->getMessage());
    Response::serverError('An error occurred while updating the order');
}



