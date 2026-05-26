<?php
/**
 * Appointment Bookings API Endpoint
 * Handles GET, POST, and status updates for customer bookings
 */

// Load global configuration and database connection
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// -------------------------------------------------------------
// GET: Retrieve bookings or count active slot bookings
// -------------------------------------------------------------
if ($method === 'GET') {
    $user_id = isset($_GET['userId']) ? trim($_GET['userId']) : '';
    $check_date = isset($_GET['date']) ? trim($_GET['date']) : '';
    $check_time = isset($_GET['time']) ? trim($_GET['time']) : '';
    $action = isset($_GET['action']) ? trim($_GET['action']) : '';
    
    try {
        // --- 1. Check Slot Availability count ---
        if ($action === 'slots_for_date' && !empty($check_date)) {
            $query = "SELECT booking_time, COUNT(*) as cnt FROM bookings WHERE booking_date = :bdate AND status != 'rejected' GROUP BY booking_time";
            $stmt = $db->prepare($query);
            $stmt->execute([':bdate' => $check_date]);
            $rows = $stmt->fetchAll();
            $result = [];
            foreach ($rows as $row) {
                $result[$row['booking_time']] = intval($row['cnt']);
            }
            sendResponse(true, $result, "Slot availability retrieved.");
        }
        
        if ($action === 'count' || (!empty($check_date) && !empty($check_time))) {
            $query = "SELECT COUNT(*) FROM bookings WHERE booking_date = :bdate AND booking_time = :btime AND status != 'rejected'";
            $stmt = $db->prepare($query);
            $stmt->execute([
                ':bdate' => $check_date,
                ':btime' => $check_time
            ]);
            $count = $stmt->fetchColumn();
            
            sendResponse(true, ["count" => intval($count)], "Slot bookings counted.");
        }
        
        // --- 2. Retrieve Bookings list ---
        $query = "SELECT * FROM bookings WHERE 1=1";
        $params = [];
        
        if (!empty($user_id) && $user_id !== 'guest') {
            $parsed_user_id = intval(str_replace('USER-', '', $user_id));
            $query .= " AND user_id = :user_id";
            $params[':user_id'] = $parsed_user_id;
        }
        
        $query .= " ORDER BY booking_date ASC, booking_time ASC";
        
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $bookings = $stmt->fetchAll();
        
        // Format fields for JSON/React compatibility
        foreach ($bookings as &$booking) {
            $booking['id'] = intval($booking['id']);
            $booking['date'] = $booking['booking_date'];
            $booking['time'] = $booking['booking_time'];
            $booking['serviceType'] = $booking['service_type'];
            $booking['userId'] = $booking['user_id'] ? 'USER-' . $booking['user_id'] : 'guest';
            $booking['userName'] = $booking['user_name'];
            $booking['userEmail'] = $booking['user_email'];
            $booking['status'] = $booking['status'];
            $booking['createdAt'] = $booking['created_at'];
        }
        
        sendResponse(true, $bookings, "Bookings retrieved successfully.");
        
    } catch (PDOException $e) {
        error_log("GET bookings query failure: " . $e->getMessage());
        sendResponse(false, null, "Failed to retrieve bookings.", 500);
    }
}

// -------------------------------------------------------------
// POST: Submit a new booking OR update status via action
// -------------------------------------------------------------
if ($method === 'POST') {
    // Support JSON or Form Data inputs
    $input = getJsonInput();
    
    $action = isset($input['action']) ? trim($input['action']) : (isset($_POST['action']) ? trim($_POST['action']) : '');
    
    // -- ROUTE TO UPDATE --
    if ($action === 'update_status') {
        handleBookingUpdate($db, $input);
    }
    
    // -- OTHERWISE: CREATE NEW BOOKING --
    $date = isset($input['date']) ? trim($input['date']) : '';
    $time = isset($input['time']) ? trim($input['time']) : '';
    $service_type = isset($input['serviceType']) ? trim($input['serviceType']) : '';
    $user_id = isset($input['userId']) ? trim($input['userId']) : null;
    $user_name = isset($input['userName']) ? trim($input['userName']) : 'Guest';
    $user_email = isset($input['userEmail']) ? trim($input['userEmail']) : '';
    
    if (empty($date) || empty($time) || empty($service_type)) {
        sendResponse(false, null, "Missing required booking details.", 400);
    }
    
    try {
        // Enforce slot capacity limit of 3 bookings per time slot
        $check_query = "SELECT COUNT(*) FROM bookings WHERE booking_date = :bdate AND booking_time = :btime AND status != 'rejected'";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->execute([':bdate' => $date, ':btime' => $time]);
        $active_count = intval($check_stmt->fetchColumn());
        
        if ($active_count >= 3) {
            sendResponse(false, null, "This time slot is already fully booked. Please select another slot.", 409);
        }
        
        // Setup numeric user ID mapping
        $parsed_user_id = null;
        if (!empty($user_id) && $user_id !== 'guest') {
            $parsed_user_id = intval(str_replace('USER-', '', $user_id));
        }
        
        $query = "INSERT INTO bookings (booking_date, booking_time, service_type, user_id, user_name, user_email, status) 
                  VALUES (:bdate, :btime, :service_type, :user_id, :user_name, :user_email, 'pending')";
        
        $stmt = $db->prepare($query);
        $stmt->execute([
            ':bdate' => $date,
            ':btime' => $time,
            ':service_type' => $service_type,
            ':user_id' => $parsed_user_id,
            ':user_name' => $user_name,
            ':user_email' => $user_email
        ]);
        
        // Log booking creation notification
        $service_label = ucfirst($service_type);
        $date_label = date('m/d/Y', strtotime($date));
        createNotification($db, $user_id, $user_email, "$service_label schedule request submitted for $date_label at $time.");
        
        sendResponse(true, null, "Appointment scheduled successfully.", 201);
        
    } catch (PDOException $e) {
        error_log("Booking submission query failure: " . $e->getMessage());
        sendResponse(false, null, "Failed to submit booking appointment.", 500);
    }
}

// -------------------------------------------------------------
// UPDATE BOOKING STATUS (Admin Action)
// -------------------------------------------------------------
function handleBookingUpdate($db, $input) {
    // Read parameters from JSON or POST body
    $booking_id = isset($input['bookingId']) ? intval($input['bookingId']) : (isset($_POST['bookingId']) ? intval($_POST['bookingId']) : 0);
    $status = isset($input['status']) ? trim($input['status']) : (isset($_POST['status']) ? trim($_POST['status']) : '');
    
    if ($booking_id <= 0 || empty($status)) {
        sendResponse(false, null, "Booking ID and status are required.", 400);
    }
    
    $valid_statuses = ['accepted', 'rejected', 'pending'];
    if (!in_array($status, $valid_statuses)) {
        sendResponse(false, null, "Invalid status designation.", 400);
    }
    
    try {
        // Fetch booking info for notification before updating
        $get_stmt = $db->prepare("SELECT user_id, user_email, booking_date, booking_time, service_type FROM bookings WHERE id = :id LIMIT 1");
        $get_stmt->execute([':id' => $booking_id]);
        $booking_info = $get_stmt->fetch();
        
        $query = "UPDATE bookings SET status = :status WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->execute([
            ':status' => $status,
            ':id' => $booking_id
        ]);
        
        if ($stmt->rowCount() > 0) {
            if ($booking_info) {
                $service_label = ucfirst($booking_info['service_type']);
                $date_label = date('m/d/Y', strtotime($booking_info['booking_date']));
                $status_txt = $status === 'accepted' ? 'approved' : ($status === 'rejected' ? 'rejected' : 'marked pending');
                createNotification($db, $booking_info['user_id'], $booking_info['user_email'], "Your $service_label booking for $date_label at {$booking_info['booking_time']} has been $status_txt.");
            }
            sendResponse(true, null, "Booking updated successfully to $status.");
        } else {
            sendResponse(false, null, "Booking not found or status already matches.", 404);
        }
        
    } catch (PDOException $e) {
        error_log("Booking status update failure: " . $e->getMessage());
        sendResponse(false, null, "Failed to update booking status.", 500);
    }
}
?>
