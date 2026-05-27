<?php
/**
 * SEARCH ORDERS API ENDPOINT
 * 
 * GET /api/orders/search
 * 
 * Searches orders by customer name or order code
 * Supports pagination
 * Customers see only their orders
 * Admins see all orders
 * 
 * Query Parameters:
 * - q: Search term (customer name or order code)
 * - page: Page number (default: 1)
 * - per_page: Items per page (default: 10)
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
    $searchTerm = isset($_GET['q']) ? Validator::sanitizeString($_GET['q']) : '';
    $page = isset($_GET['page']) ? max(1, Validator::sanitizeInt($_GET['page'])) : 1;
    $perPage = isset($_GET['per_page']) ? max(1, Validator::sanitizeInt($_GET['per_page'])) : ITEMS_PER_PAGE;

    if (empty($searchTerm)) {
        Response::validationError(['q' => 'Search term is required']);
    }

    // Build search query
    $query = "SELECT * FROM orders WHERE (customer_name LIKE ? OR order_code LIKE ?)";
    $searchParam = "%" . $searchTerm . "%";
    $params = [$searchParam, $searchParam];
    $types = "ss";

    // If customer, only show their orders
    if (Auth::isCustomer($currentUser)) {
        $query .= " AND user_id = ?";
        $params[] = $currentUser['id'];
        $types .= "i";
    }

    // Get total count
    $countQuery = "SELECT COUNT(*) as total FROM orders WHERE (customer_name LIKE '%" . $db->getConnection()->real_escape_string($searchTerm) . "%' OR order_code LIKE '%" . $db->getConnection()->real_escape_string($searchTerm) . "%')";
    if (Auth::isCustomer($currentUser)) {
        $countQuery .= " AND user_id = " . $currentUser['id'];
    }

    $countResult = $db->getRow($countQuery);
    $total = $countResult['total'] ?? 0;

    // Add pagination
    $query .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";
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
        'Search results retrieved successfully'
    );

} catch (Exception $e) {
    error_log('Search Orders Error: ' . $e->getMessage());
    Response::serverError('An error occurred while searching orders');
}



