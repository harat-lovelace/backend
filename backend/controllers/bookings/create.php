<?php
/**
 * CREATE BOOKING API ENDPOINT
 * 
 * POST /api/bookings
 * 
 * Creates a new appointment booking
 * Validates slot availability (max 3 bookings per time slot)
 * Validates date is within the booking window
 * 
 * Request Body:
 * - booking_date: Date for booking (YYYY-MM-DD)
 * - booking_time: Time slot (e.g., "10:00 AM")
 * - service_type: "pickup" or "dropoff"
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
$bookingDate = isset($input['booking_date']) ? Validator::sanitizeString($input['booking_date']) : '';
$bookingTime = isset($input['booking_time']) ? Validator::sanitizeString($input['booking_time']) : '';
$serviceType = isset($input['service_type']) ? Validator::sanitizeString($input['service_type']) : 'dropoff';

// Validate input
$valid = true;

if (!Validator::required($bookingDate, 'booking_date')) $valid = false;
if (!Validator::date($bookingDate, 'booking_date')) $valid = false;
if (!Validator::futureDate($bookingDate, 'booking_date')) $valid = false;
if (!Validator::dateRange($bookingDate, date('Y-m-d'), date('Y-m-d', strtotime('+' . BOOKING_WINDOW_DAYS . ' days')), 'booking_date')) $valid = false;
if (!Validator::required($bookingTime, 'booking_time')) $valid = false;
if (!Validator::inArray($bookingTime, BOOKING_TIME_SLOTS, 'booking_time')) $valid = false;
if (!Validator::inArray($serviceType, ['pickup', 'dropoff'], 'service_type')) $valid = false;

// Return validation errors if any
if (!$valid) {
    Response::validationError(Validator::getErrors());
}

try {
    // Initialize database
    $db = new Database();

    // Check slot availability
    $slotCount = $db->getValue(
        "SELECT COUNT(*) FROM bookings WHERE booking_date = ? AND booking_time = ? AND status != 'rejected'",
        [$bookingDate, $bookingTime],
        "ss"
    );

    if ($slotCount >= MAX_SLOTS_PER_TIME) {
        Response::error('This time slot is fully booked. Please choose another time.', 409);
    }

    // Get user details
    $user = $db->getRow(
        "SELECT email, full_name FROM users WHERE id = ?",
        [$currentUser['id']],
        "i"
    );

    // Insert booking
    $query = "INSERT INTO bookings (user_id, booking_date, booking_time, service_type, user_name, user_email) 
              VALUES (?, ?, ?, ?, ?, ?)";
    
    $result = $db->execute(
        $query,
        [
            $currentUser['id'],
            $bookingDate,
            $bookingTime,
            $serviceType,
            $user['full_name'],
            $user['email']
        ],
        "isssss"
    );

    if (!$result) {
        throw new Exception('Failed to create booking');
    }

    // Get the newly created booking
    $bookingId = $db->lastInsertId();
    $newBooking = $db->getRow(
        "SELECT * FROM bookings WHERE id = ?",
        [$bookingId],
        "i"
    );

    if (!$newBooking) {
        throw new Exception('Failed to retrieve created booking');
    }

    // Return success response
    Response::success($newBooking, 'Booking created successfully', 201);

} catch (Exception $e) {
    error_log('Create Booking Error: ' . $e->getMessage());
    Response::serverError('An error occurred while creating the booking');
}



