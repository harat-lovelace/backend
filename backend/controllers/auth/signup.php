<?php
/**
 * USER SIGNUP API ENDPOINT
 * 
 * POST /api/auth/signup
 * 
 * Creates a new user account with provided credentials
 * Auto-assigns 'customer' role to new users
 * Returns JWT token on success
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

// Extract and sanitize input - support both 'name' and 'full_name' field names
$fullName = isset($input['name']) ? Validator::sanitizeString($input['name']) : 
            (isset($input['full_name']) ? Validator::sanitizeString($input['full_name']) : '');
$email = isset($input['email']) ? Validator::sanitizeEmail($input['email']) : '';
$password = $input['password'] ?? '';
// Support optional confirm_password - if not provided, just use password
$confirmPassword = $input['confirm_password'] ?? $input['password'] ?? '';
$phoneNumber = isset($input['phone_number']) ? Validator::sanitizeString($input['phone_number']) : '';
$role = isset($input['role']) && in_array($input['role'], ['customer', 'admin']) ? $input['role'] : 'customer';

// Validate input
$valid = true;

if (!Validator::required($fullName, 'name')) $valid = false;
if (!Validator::required($email, 'email')) $valid = false;
if (!Validator::email($email, 'email')) $valid = false;
if (!Validator::required($password, 'password')) $valid = false;
if (!Validator::minLength($password, 6, 'password')) $valid = false;
if (!Validator::match($password, $confirmPassword, 'passwords')) $valid = false;

// Return validation errors if any
if (!$valid) {
    Response::validationError(Validator::getErrors());
}

// Initialize database
$db = new Database();

// Check if email already exists
$existingUser = $db->getRow(
    "SELECT id FROM users WHERE email = ?",
    [$email],
    "s"
);

if ($existingUser) {
    Response::error('Email already exists', 409);
}

try {
    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_ALGO);

    // Insert new user with the role from frontend
    $query = "INSERT INTO users (email, password, full_name, role, phone_number) 
              VALUES (?, ?, ?, ?, ?)";
    
    $result = $db->execute(
        $query,
        [$email, $hashedPassword, $fullName, $role, $phoneNumber],
        "sssss"
    );

    if (!$result) {
        throw new Exception('Failed to create user');
    }

    // Get the newly created user
    $userId = $db->lastInsertId();
    $newUser = $db->getRow(
        "SELECT id, email, full_name, role FROM users WHERE id = ?",
        [$userId],
        "i"
    );

    if (!$newUser) {
        throw new Exception('Failed to retrieve created user');
    }

    // Generate JWT token
    $token = Auth::generateToken([
        'id' => $newUser['id'],
        'email' => $newUser['email'],
        'full_name' => $newUser['full_name'],
        'role' => $newUser['role']
    ]);

    // Return success response with both 'full_name' and 'name' for frontend compatibility
    Response::success(
        [
            'id' => $newUser['id'],
            'email' => $newUser['email'],
            'name' => $newUser['full_name'],
            'full_name' => $newUser['full_name'],
            'role' => $newUser['role'],
            'token' => $token
        ],
        'User registered successfully',
        201
    );

} catch (Exception $e) {
    error_log('Signup Error: ' . $e->getMessage());
    Response::serverError('An error occurred during signup');
}



