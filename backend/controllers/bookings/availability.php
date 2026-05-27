<?php
/**
 * CHECK BOOKING AVAILABILITY API ENDPOINT
 * 
 * GET /api/bookings/availability
 * 
 * Checks available time slots for a specific date
 * Returns available and booked slots
 * 
 * Query Parameters:
 * - date: Date to check availability (YYYY-MM-DD)
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

// Get query parameters
$date = isset($_GET['date']) ? Validator::sanitizeString($_GET['date']) : '';

// Validate input
if (empty($date)) {
    Response::validationError(['date' => 'Date is required']);
}

if (!Validator::date($date)) {
    Response::validationError(['date' => 'Invalid date format. Use YYYY-MM-DD']);
}

if (!Validator::futureDate($date)) {
    Response::validationError(['date' => 'Date must be in the future']);
}

try {
    // Initialize database
    $db = new Database();

    // Get all time slots
    $timeSlots = BOOKING_TIME_SLOTS;
    $availability = [];

    foreach ($timeSlots as $slot) {
        // Count existing bookings for this slot
        $count = $db->getValue(
            "SELECT COUNT(*) FROM bookings WHERE booking_date = ? AND booking_time = ? AND status != 'rejected'",
            [$date, $slot],
            "ss"
        );

        $availability[] = [
            'time' => $slot,
            'available' => $count < MAX_SLOTS_PER_TIME,
            'booked_count' => $count,
            'max_slots' => MAX_SLOTS_PER_TIME
        ];
    }

    // Return availability
    Response::success(
        [
            'date' => $date,
            'slots' => $availability,
            'max_slots_per_time' => MAX_SLOTS_PER_TIME
        ],
        'Availability retrieved successfully'
    );

} catch (Exception $e) {
    error_log('Check Availability Error: ' . $e->getMessage());
    Response::serverError('An error occurred while checking availability');
}



