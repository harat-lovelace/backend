<?php
/**
 * GET SINGLE BOOKING API ENDPOINT
 * 
 * GET /api/bookings/{id}
 * 
 * Retrieves a single booking by ID
 * Customers can only view their own bookings
 * Admins can view any booking
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

// Get booking ID from URL
$bookingId = isset($_GET['id']) ? Validator::sanitizeInt($_GET['id']) : 0;

if ($bookingId <= 0) {
    Response::validationError(['id' => 'Booking ID is required']);
}

try {
    // Initialize database
    $db = new Database();

    // Get booking
    $booking = $db->getRow(
        "SELECT * FROM bookings WHERE id = ?",
        [$bookingId],
        "i"
    );

    if (!$booking) {
        Response::notFound('Booking not found');
    }

    // Check authorization (customers can only view their own bookings)
    if (Auth::isCustomer($currentUser) && $booking['user_id'] != $currentUser['id']) {
        Response::forbidden('You do not have permission to view this booking');
    }

    // Return booking
    Response::success($booking, 'Booking retrieved successfully');

} catch (Exception $e) {
    error_log('Get Booking Error: ' . $e->getMessage());
    Response::serverError('An error occurred while retrieving the booking');
}



