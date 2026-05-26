<?php
/**
 * CREATE ORDER API ENDPOINT
 * 
 * POST /api/orders
 * 
 * Creates a new laundry order
 * Can be created by customers or admin on behalf of customers
 * Auto-generates order code (LDY-XXXX format)
 * 
 * @category API
 * @subpackage Orders
 */

// Bootstrap application
require_once(__DIR__ . '/../../init.php');

// Check request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::methodNotAllowed('Only POST request is allowed');
}

// Require authentication
$currentUser = Auth::requireAuth();

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Reset validation errors
Validator::reset();

// Extract and sanitize input
$customerName = isset($input['customer_name']) ? Validator::sanitizeString($input['customer_name']) : '';
$contactNumber = isset($input['contact_number']) ? Validator::sanitizeString($input['contact_number']) : '';
$laundryType = isset($input['laundry_type']) ? Validator::sanitizeString($input['laundry_type']) : '';
$weight = isset($input['weight']) ? Validator::sanitizeFloat($input['weight']) : 0;
$specialInstructions = isset($input['special_instructions']) ? Validator::sanitizeString($input['special_instructions']) : '';

// Determine user ID
// If admin is creating order for customer, use the user_id from input, otherwise use current user
$userId = $currentUser['id'];
if (Auth::isAdmin($currentUser) && isset($input['user_id'])) {
    $userId = Validator::sanitizeInt($input['user_id']);
}

// Validate input
$valid = true;

if (!Validator::required($customerName, 'customer_name')) $valid = false;
if (!Validator::required($contactNumber, 'contact_number')) $valid = false;
if (!Validator::phone($contactNumber, 'contact_number')) $valid = false;
if (!Validator::required($laundryType, 'laundry_type')) $valid = false;
if (!Validator::inArray($laundryType, array_keys(LAUNDRY_TYPES), 'laundry_type')) $valid = false;
if (!Validator::required((string)$weight, 'weight')) $valid = false;
if (!Validator::numeric($weight, 'weight')) $valid = false;
if (!Validator::positive($weight, 'weight')) $valid = false;

// Return validation errors if any
if (!$valid) {
    Response::validationError(Validator::getErrors());
}

try {
    // Initialize database
    $db = new Database();

    // Get user email for the order
    $user = $db->getRow(
        "SELECT email FROM users WHERE id = ?",
        [$userId],
        "i"
    );

    if (!$user) {
        Response::notFound('User not found');
    }

    // Generate unique order code (LDY-XXXX format)
    $orderCode = 'LDY-' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
    
    // Check if order code already exists
    $existingOrder = $db->getRow(
        "SELECT id FROM orders WHERE order_code = ?",
        [$orderCode],
        "s"
    );

    // If order code exists, generate a new one
    if ($existingOrder) {
        $orderCode = 'LDY-' . str_pad(mt_rand(10000, 99999), 5, '0', STR_PAD_LEFT);
    }

    // Calculate estimated pickup date (default: 3 days from now)
    $estimatedPickup = date('Y-m-d', strtotime('+' . DEFAULT_PICKUP_DAYS . ' days'));

    // Insert order into database
    $query = "INSERT INTO orders (order_code, user_id, customer_name, contact_number, laundry_type, weight, special_instructions, estimated_pickup) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    $result = $db->execute(
        $query,
        [
            $orderCode,
            $userId,
            $customerName,
            $contactNumber,
            $laundryType,
            $weight,
            $specialInstructions,
            $estimatedPickup
        ],
        "sisddsss"
    );

    if (!$result) {
        throw new Exception('Failed to create order');
    }

    // Get the newly created order
    $orderId = $db->lastInsertId();
    $newOrder = $db->getRow(
        "SELECT * FROM orders WHERE id = ?",
        [$orderId],
        "i"
    );

    if (!$newOrder) {
        throw new Exception('Failed to retrieve created order');
    }

    // Return success response
    Response::success($newOrder, 'Order created successfully', 201);

} catch (Exception $e) {
    error_log('Create Order Error: ' . $e->getMessage());
    Response::serverError('An error occurred while creating the order');
}



