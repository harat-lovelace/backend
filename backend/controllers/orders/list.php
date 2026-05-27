<?php
/**
 * LIST ORDERS API ENDPOINT
 * 
 * GET /api/orders
 * 
 * Retrieves orders with filtering
 * Customers see only their orders
 * Admins see all orders
 * Supports pagination and filtering by status
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - per_page: Items per page (default: 10)
 * - status: Filter by order status
 * - sort: Sort by field (created_at, status, customer_name)
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
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::methodNotAllowed('Only GET request is allowed');
}

// Require authentication
$currentUser = Auth::requireAuth();

try {
    // Initialize database
    $db = new Database();

    // Get query parameters
    $page = isset($_GET['page']) ? max(1, Validator::sanitizeInt($_GET['page'])) : 1;
    $perPage = isset($_GET['per_page']) ? max(1, Validator::sanitizeInt($_GET['per_page'])) : ITEMS_PER_PAGE;
    $status = isset($_GET['status']) ? Validator::sanitizeString($_GET['status']) : '';
    $sort = isset($_GET['sort']) ? Validator::sanitizeString($_GET['sort']) : 'created_at';

    // Validate status if provided
    if (!empty($status) && !in_array($status, array_keys(ORDER_STATUSES))) {
        Response::validationError(['status' => 'Invalid status value']);
    }

    // Validate sort field
    $allowedSortFields = ['created_at', 'status', 'customer_name', 'weight'];
    if (!in_array($sort, $allowedSortFields)) {
        $sort = 'created_at';
    }

    // Build query
    $query = "SELECT * FROM orders WHERE 1=1";
    $params = [];
    $types = "";

    // If customer, only show their orders
    if (Auth::isCustomer($currentUser)) {
        $query .= " AND user_id = ?";
        $params[] = $currentUser['id'];
        $types .= "i";
    }

    // Filter by status if provided
    if (!empty($status)) {
        $query .= " AND status = ?";
        $params[] = $status;
        $types .= "s";
    }

    // Get total count
    $countQuery = "SELECT COUNT(*) as total FROM orders WHERE 1=1";
    if (Auth::isCustomer($currentUser)) {
        $countQuery .= " AND user_id = " . $currentUser['id'];
    }
    if (!empty($status)) {
        $countQuery .= " AND status = '" . $db->getConnection()->real_escape_string($status) . "'";
    }

    $countResult = $db->getRow($countQuery);
    $total = $countResult['total'] ?? 0;

    // Add sorting and pagination
    $query .= " ORDER BY " . $sort . " DESC LIMIT ? OFFSET ?";
    $params[] = $perPage;
    $params[] = ($page - 1) * $perPage;
    $types .= "ii";

    // Get orders
    $orders = $db->getResults($query, $params, $types);

    // Return paginated response
    Response::paginated(
        $orders,
        $total,
        $page,
        $perPage,
        'Orders retrieved successfully'
    );

} catch (Exception $e) {
    error_log('List Orders Error: ' . $e->getMessage());
    Response::serverError('An error occurred while retrieving orders');
}



