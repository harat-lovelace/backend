<?php
/**
 * USER LOGIN API ENDPOINT
 * 
 * POST /api/auth/login
 * 
 * Authenticates user with email and password
 * Returns JWT token on successful login
 * 
 * @category API
 * @subpackage Auth
 */

// Bootstrap application
require_once(__DIR__ . '/../../init.php');

// Check request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::methodNotAllowed('Only POST request is allowed');
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Reset validation errors
Validator::reset();

// Extract and sanitize input
$email = isset($input['email']) ? Validator::sanitizeEmail($input['email']) : '';
$password = $input['password'] ?? '';

// Validate input
$valid = true;

if (!Validator::required($email, 'email')) $valid = false;
if (!Validator::email($email, 'email')) $valid = false;
if (!Validator::required($password, 'password')) $valid = false;

// Return validation errors if any
if (!$valid) {
    Response::validationError(Validator::getErrors());
}

try {
    // Initialize database
    $db = new Database();

    // Get user by email
    $user = $db->getRow(
        "SELECT id, email, password, full_name, role FROM users WHERE email = ?",
        [$email],
        "s"
    );

    // Check if user exists
    if (!$user) {
        Response::error('Invalid email or password', 401);
    }

    // Verify password
    if (!password_verify($password, $user['password'])) {
        Response::error('Invalid email or password', 401);
    }

    // Generate JWT token
    $token = Auth::generateToken([
        'id' => $user['id'],
        'email' => $user['email'],
        'full_name' => $user['full_name'],
        'role' => $user['role']
    ]);

    // Return success response
    Response::success(
        [
            'id' => $user['id'],
            'email' => $user['email'],
            'full_name' => $user['full_name'],
            'role' => $user['role'],
            'token' => $token
        ],
        'Login successful'
    );

} catch (Exception $e) {
    error_log('Login Error: ' . $e->getMessage());
    Response::serverError('An error occurred during login');
}



