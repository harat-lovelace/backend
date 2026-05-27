<?php
/**
 * GET CURRENT USER API ENDPOINT
 * 
 * GET /api/auth/me
 * 
 * Returns the current authenticated user data
 * Requires valid JWT token
 * 
 * @category API
 * @subpackage Auth
 */

// Bootstrap application
require_once(__DIR__ . '/../../init.php');

// Check request method
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::methodNotAllowed('Only GET request is allowed');
}

try {
    // Require authentication
    $currentUser = Auth::requireAuth();

    // Initialize database
    $db = new Database();

    // Get updated user data from database
    $user = $db->getRow(
        "SELECT id, email, full_name, role, phone_number, address, created_at FROM users WHERE id = ?",
        [$currentUser['id']],
        "i"
    );

    if (!$user) {
        Response::notFound('User not found');
    }

    // Return user data
    Response::success($user, 'User data retrieved successfully');

} catch (Exception $e) {
    error_log('Get User Error: ' . $e->getMessage());
    Response::serverError('An error occurred while retrieving user data');
}



