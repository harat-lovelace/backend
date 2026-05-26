<?php
/**
 * User Registration API Endpoint
 * Handles POST requests with JSON payload to register a new customer
 */

// Load global configuration and database connection
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, null, "Method not allowed. Use POST.", 451); // 405 Method Not Allowed
}

// Read raw JSON input
$input = getJsonInput();

$name = isset($input['name']) ? trim($input['name']) : '';
$email = isset($input['email']) ? trim($input['email']) : '';
$password = isset($input['password']) ? $input['password'] : '';
$role = isset($input['role']) ? trim($input['role']) : 'customer';

// Validate role
if (!in_array($role, ['customer', 'admin'])) {
    $role = 'customer';
}

// 1. Validation checks
if (empty($name)) {
    sendResponse(false, null, "Full name is required.", 400);
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse(false, null, "A valid email address is required.", 400);
}

if (empty($password) || strlen($password) < 6) {
    sendResponse(false, null, "Password must be at least 6 characters.", 400);
}

// 2. Database interaction
$database = new Database();
$db = $database->getConnection();

try {
    // Check if email already exists
    $check_query = "SELECT id FROM users WHERE email = :email LIMIT 1";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->execute([':email' => $email]);

    if ($check_stmt->rowCount() > 0) {
        sendResponse(false, null, "An account with this email already exists.", 409); // 409 Conflict
    }

    // Hash password securely
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert new user with selected role
    $insert_query = "INSERT INTO users (name, email, password, role) VALUES (:name, :email, :password, :role)";
    $insert_stmt = $db->prepare($insert_query);
    
    $insert_stmt->execute([
        ':name' => $name,
        ':email' => $email,
        ':password' => $hashed_password,
        ':role' => $role
    ]);

    // Retrieve the new user's ID
    $new_user_id = $db->lastInsertId();

    // 3. Auto Login (Establish Session)
    $user_payload = [
        "id" => (string)$new_user_id,
        "name" => $name,
        "email" => $email,
        "role" => $role
    ];

    $_SESSION['user'] = $user_payload;

    // Return successfully registered user details
    sendResponse(true, $user_payload, "Registration successful.", 201);

} catch (PDOException $e) {
    error_log("Signup query failure: " . $e->getMessage());
    sendResponse(false, null, "A database error occurred. Please try again later.", 500);
}
?>
