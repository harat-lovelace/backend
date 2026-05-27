<?php
/**
 * PROFILE API ENDPOINT
 * 
 * POST /api/profile - Update user profile
 * 
 * @category API
 * @package LaundrySystem
 */

// Bootstrap application
require_once(__DIR__ . '/../init.php');

// Require authentication
$currentUser = Auth::requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::methodNotAllowed('Only POST method is allowed');
}

try {
    // Get JSON request body
    $input = json_decode(file_get_contents('php://input'), true);
    
    $name = isset($input['name']) ? trim($input['name']) : '';
    $email = isset($input['email']) ? trim($input['email']) : '';
    $password = isset($input['password']) ? trim($input['password']) : '';

    // Validate inputs
    if (empty($name)) {
        Response::error('Name is required', 400);
    }

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        Response::error('A valid email address is required', 400);
    }

    $db = new Database();

    // Check if the email is already taken by another user
    $existing = $db->getRow(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [$email, $currentUser['id']],
        "si"
    );

    if ($existing) {
        Response::error('Email is already taken by another account', 400);
    }

    if (!empty($password)) {
        // Hash the new password
        $hashed = password_hash($password, PASSWORD_ALGO);
        
        $db->execute(
            "UPDATE users SET full_name = ?, email = ?, password = ? WHERE id = ?",
            [$name, $email, $hashed, $currentUser['id']],
            "sssi"
        );
    } else {
        $db->execute(
            "UPDATE users SET full_name = ?, email = ? WHERE id = ?",
            [$name, $email, $currentUser['id']],
            "ssi"
        );
    }

    // Retrieve updated user details
    $updated = $db->getRow(
        "SELECT id, full_name, email, role FROM users WHERE id = ?",
        [$currentUser['id']],
        "i"
    );

    if (!$updated) {
        Response::notFound('User not found after update');
    }

    // Format response data to match frontend expectations
    $data = [
        'id' => (string)$updated['id'],
        'name' => $updated['full_name'],
        'email' => $updated['email'],
        'role' => $updated['role']
    ];

    Response::success($data, 'Profile updated successfully');

} catch (Exception $e) {
    error_log('Profile Controller Error: ' . $e->getMessage());
    Response::serverError('An error occurred while updating profile');
}
