<?php
/**
 * NOTIFICATIONS API ENDPOINT
 * 
 * GET /api/notifications - List notifications for current user
 * POST /api/notifications - Mark notifications as read
 * 
 * @category API
 * @package LaundrySystem
 */

// Bootstrap application
require_once(__DIR__ . '/../init.php');

// Require authentication
$currentUser = Auth::requireAuth();

$method = $_SERVER['REQUEST_METHOD'];

try {
    $db = new Database();

    if ($method === 'GET') {
        // Fetch notifications for the authenticated user
        $notifications = $db->getResults(
            "SELECT id, user_id, order_id, title, message, type, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
            [$currentUser['id']],
            "i"
        );

        $formatted = [];
        foreach ($notifications as $n) {
            $formatted[] = [
                'id' => (int)$n['id'],
                'userId' => (int)$n['user_id'],
                'orderId' => $n['order_id'] !== null ? (int)$n['order_id'] : null,
                'title' => $n['title'],
                'message' => $n['message'],
                'type' => $n['type'],
                'isRead' => (bool)$n['is_read'],
                'createdAt' => $n['created_at']
            ];
        }

        Response::success($formatted, 'Notifications retrieved successfully');

    } elseif ($method === 'POST') {
        // Get JSON request body
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $input['action'] ?? '';

        if ($action === 'mark_read') {
            $notificationId = isset($input['notificationId']) ? (int)$input['notificationId'] : 0;
            
            $db->execute(
                "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
                [$notificationId, $currentUser['id']],
                "ii"
            );

            Response::success(null, 'Notification marked as read');

        } elseif ($action === 'mark_all_read') {
            $db->execute(
                "UPDATE notifications SET is_read = 1 WHERE user_id = ?",
                [$currentUser['id']],
                "i"
            );

            Response::success(null, 'All notifications marked as read');

        } else {
            Response::error('Invalid notification action', 400);
        }
    } else {
        Response::methodNotAllowed('Only GET and POST methods are allowed');
    }

} catch (Exception $e) {
    error_log('Notifications Controller Error: ' . $e->getMessage());
    Response::serverError('An error occurred while processing notifications');
}
