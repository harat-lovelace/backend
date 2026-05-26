<?php
/**
 * Notifications API Endpoint
 * Handles GET (fetching history) and POST (marking as read)
 */

// Load global configuration and database connection
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// -------------------------------------------------------------
// GET: Retrieve Notifications for a user
// -------------------------------------------------------------
if ($method === 'GET') {
    $email = isset($_GET['email']) ? trim($_GET['email']) : '';
    
    if (empty($email)) {
        sendResponse(false, null, "Email parameter is required.", 400);
    }
    
    try {
        $query = "SELECT * FROM notifications WHERE user_email = :email ORDER BY created_at DESC LIMIT 50";
        $stmt = $db->prepare($query);
        $stmt->execute([':email' => $email]);
        $notifications = $stmt->fetchAll();
        
        // Format for JSON response
        foreach ($notifications as &$notif) {
            $notif['id'] = intval($notif['id']);
            $notif['isRead'] = (bool)$notif['is_read'];
            $notif['createdAt'] = $notif['created_at'];
        }
        
        sendResponse(true, $notifications, "Notifications retrieved successfully.");
        
    } catch (PDOException $e) {
        error_log("GET notifications query failure: " . $e->getMessage());
        sendResponse(false, null, "Failed to retrieve notifications.", 500);
    }
}

// -------------------------------------------------------------
// POST: Mark notifications as read / mark all as read
// -------------------------------------------------------------
if ($method === 'POST') {
    $input = getJsonInput();
    $action = isset($input['action']) ? trim($input['action']) : '';
    $email = isset($input['email']) ? trim($input['email']) : '';
    
    if ($action === 'mark_all_read') {
        if (empty($email)) {
            sendResponse(false, null, "Email is required.", 400);
        }
        
        try {
            $query = "UPDATE notifications SET is_read = 1 WHERE user_email = :email";
            $stmt = $db->prepare($query);
            $stmt->execute([':email' => $email]);
            
            sendResponse(true, null, "All notifications marked as read.");
            
        } catch (PDOException $e) {
            error_log("Mark all read failure: " . $e->getMessage());
            sendResponse(false, null, "Failed to update notifications.", 500);
        }
    }
    
    if ($action === 'mark_read') {
        $notif_id = isset($input['notificationId']) ? intval($input['notificationId']) : 0;
        
        if ($notif_id <= 0) {
            sendResponse(false, null, "Notification ID is required.", 400);
        }
        
        try {
            $query = "UPDATE notifications SET is_read = 1 WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->execute([':id' => $notif_id]);
            
            sendResponse(true, null, "Notification marked as read.");
            
        } catch (PDOException $e) {
            error_log("Mark read failure: " . $e->getMessage());
            sendResponse(false, null, "Failed to update notification.", 500);
        }
    }
    
    sendResponse(false, null, "Invalid action specified.", 400);
}
?>
