<?php
/**
 * UPDATE BOOKING API ENDPOINT
 * 
 * PUT /api/bookings/{id}
 * 
 * Updates a booking
 * Admin only: Can update status (accept/reject)
 * Customers can update their own bookings before they are confirmed
 * 
 * Request Body:
 * - status: "pending", "accepted", or "rejected"
 * - booking_date: New booking date (for customer changes)
 * - booking_time: New booking time (for customer changes)
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
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    Response::methodNotAllowed('Only PUT request is allowed');
}

// Require authentication
$currentUser = Auth::requireAuth();

// Get booking ID from URL
$bookingId = isset($_GET['id']) ? Validator::sanitizeInt($_GET['id']) : 0;

if ($bookingId <= 0) {
    Response::validationError(['id' => 'Booking ID is required']);
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Reset validation errors
Validator::reset();

// Extract and sanitize input
$status = isset($input['status']) ? Validator::sanitizeString($input['status']) : '';
$newBookingDate = isset($input['booking_date']) ? Validator::sanitizeString($input['booking_date']) : '';
$newBookingTime = isset($input['booking_time']) ? Validator::sanitizeString($input['booking_time']) : '';

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
    if (Auth::isCustomer($currentUser) && $booking['user_id'] != $currentUser['id']) {
        Response::forbidden('You can only update your own bookings');
    }

    // Validate input
    $valid = true;

    if (!empty($status)) {
        if (!Validator::inArray($status, ['pending', 'accepted', 'rejected'], 'status')) {
            $valid = false;
        }
        // Only admin can change status
        if (!Auth::isAdmin($currentUser)) {
            Response::forbidden('Only admin can change booking status');
        }
    }

    if (!empty($newBookingDate)) {
        if (!Validator::date($newBookingDate, 'booking_date')) {
            $valid = false;
        } elseif (!Validator::futureDate($newBookingDate, 'booking_date')) {
            $valid = false;
        }
        // Only customers can reschedule their own bookings
        if (Auth::isAdmin($currentUser)) {
            Response::forbidden('Admin cannot reschedule bookings');
        }
    }

    if (!empty($newBookingTime)) {
        if (!Validator::inArray($newBookingTime, BOOKING_TIME_SLOTS, 'booking_time')) {
            $valid = false;
        }
        // Only customers can reschedule their own bookings
        if (Auth::isAdmin($currentUser)) {
            Response::forbidden('Admin cannot reschedule bookings');
        }
    }

    // Return validation errors if any
    if (!$valid) {
        Response::validationError(Validator::getErrors());
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

    if (!empty($newBookingDate)) {
        $updateFields[] = "booking_date = ?";
        $params[] = $newBookingDate;
        $types .= "s";
    }

    if (!empty($newBookingTime)) {
        // Check slot availability for new slot
        $slotCount = $db->getValue(
            "SELECT COUNT(*) FROM bookings WHERE booking_date = ? AND booking_time = ? AND id != ? AND status != 'rejected'",
            [$newBookingDate ?: $booking['booking_date'], $newBookingTime ?: $booking['booking_time'], $bookingId],
            "ssi"
        );

        if ($slotCount >= MAX_SLOTS_PER_TIME) {
            Response::error('The selected time slot is not available', 409);
        }

        $updateFields[] = "booking_time = ?";
        $params[] = $newBookingTime;
        $types .= "s";
    }

    // If no fields to update, return error
    if (empty($updateFields)) {
        Response::validationError(['message' => 'No fields to update']);
    }

    // Add booking ID to params
    $params[] = $bookingId;
    $types .= "i";

    // Update booking
    $query = "UPDATE bookings SET " . implode(", ", $updateFields) . ", updated_at = NOW() WHERE id = ?";
    $result = $db->execute($query, $params, $types);

    if (!$result) {
        throw new Exception('Failed to update booking');
    }

    // Get updated booking
    $updatedBooking = $db->getRow(
        "SELECT * FROM bookings WHERE id = ?",
        [$bookingId],
        "i"
    );

    // Return success response
    Response::success($updatedBooking, 'Booking updated successfully');

} catch (Exception $e) {
    error_log('Update Booking Error: ' . $e->getMessage());
    Response::serverError('An error occurred while updating the booking');
}



