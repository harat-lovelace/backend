<?php
/**
 * DELETE BOOKING API ENDPOINT
 * 
 * DELETE /api/bookings/{id}
 * 
 * Deletes a booking
 * Customers can delete their own pending bookings
 * Admins can delete any booking
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
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    Response::methodNotAllowed('Only DELETE request is allowed');
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

    // Check authorization
    if (Auth::isCustomer($currentUser)) {
        // Customers can only delete their own pending bookings
        if ($booking['user_id'] != $currentUser['id']) {
            Response::forbidden('You can only delete your own bookings');
        }
        if ($booking['status'] !== 'pending') {
            Response::forbidden('You can only delete pending bookings');
        }
    }

    // Delete booking
    $result = $db->execute(
        "DELETE FROM bookings WHERE id = ?",
        [$bookingId],
        "i"
    );

    if (!$result) {
        throw new Exception('Failed to delete booking');
    }

    // Return success response
    Response::success(['id' => $bookingId], 'Booking deleted successfully');

} catch (Exception $e) {
    error_log('Delete Booking Error: ' . $e->getMessage());
    Response::serverError('An error occurred while deleting the booking');
}



