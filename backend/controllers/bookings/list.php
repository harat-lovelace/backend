<?php
/**
 * LIST BOOKINGS API ENDPOINT
 * 
 * GET /api/bookings
 * 
 * Retrieves bookings with filtering
 * Customers see only their bookings
 * Admins see all bookings
 * Supports pagination and filtering by status or date
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - per_page: Items per page (default: 10)
 * - status: Filter by booking status (pending, accepted, rejected)
 * - date: Filter by booking date (YYYY-MM-DD)
 * - sort: Sort by field (booking_date, created_at)
 * 
 * @category API
 * @subpackage Bookings
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
    $date = isset($_GET['date']) ? Validator::sanitizeString($_GET['date']) : '';
    $sort = isset($_GET['sort']) ? Validator::sanitizeString($_GET['sort']) : 'booking_date';

    // Validate status if provided
    if (!empty($status) && !in_array($status, ['pending', 'accepted', 'rejected'])) {
        Response::validationError(['status' => 'Invalid status value']);
    }

    // Validate date if provided
    if (!empty($date)) {
        if (!Validator::date($date)) {
            Response::validationError(['date' => 'Invalid date format']);
        }
    }

    // Validate sort field
    $allowedSortFields = ['booking_date', 'created_at'];
    if (!in_array($sort, $allowedSortFields)) {
        $sort = 'booking_date';
    }

    // Build query
    $query = "SELECT * FROM bookings WHERE 1=1";
    $params = [];
    $types = "";

    // If customer, only show their bookings
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

    // Filter by date if provided
    if (!empty($date)) {
        $query .= " AND booking_date = ?";
        $params[] = $date;
        $types .= "s";
    }

    // Get total count
    $countQuery = "SELECT COUNT(*) as total FROM bookings WHERE 1=1";
    if (Auth::isCustomer($currentUser)) {
        $countQuery .= " AND user_id = " . $currentUser['id'];
    }
    if (!empty($status)) {
        $countQuery .= " AND status = '" . $db->getConnection()->real_escape_string($status) . "'";
    }
    if (!empty($date)) {
        $countQuery .= " AND booking_date = '" . $db->getConnection()->real_escape_string($date) . "'";
    }

    $countResult = $db->getRow($countQuery);
    $total = $countResult['total'] ?? 0;

    // Add sorting and pagination
    $query .= " ORDER BY " . $sort . " ASC LIMIT ? OFFSET ?";
    $params[] = $perPage;
    $params[] = ($page - 1) * $perPage;
    $types .= "ii";

    // Get bookings
    $bookings = $db->getResults($query, $params, $types);

    // Return paginated response
    Response::paginated(
        $bookings,
        $total,
        $page,
        $perPage,
        'Bookings retrieved successfully'
    );

} catch (Exception $e) {
    error_log('List Bookings Error: ' . $e->getMessage());
    Response::serverError('An error occurred while retrieving bookings');
}



