<?php
/**
 * User Login API Endpoint
 * Handles POST requests with JSON payload to authenticate a user
 */

// Load global configuration and database connection
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, null, "Method not allowed. Use POST.", 451);
}

// Read raw JSON input
$input = getJsonInput();

$email = isset($input['email']) ? trim($input['email']) : '';
$password = isset($input['password']) ? $input['password'] : '';

// 1. Validation checks
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse(false, null, "A valid email address is required.", 400);
}

if (empty($password)) {
    sendResponse(false, null, "Password is required.", 400);
}

// 2. Database authentication
$database = new Database();
$db = $database->getConnection();

try {
    // Select user with email
    $query = "SELECT id, name, email, password, role FROM users WHERE email = :email LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->execute([':email' => $email]);

    $user = $stmt->fetch();

    // Verify user and password
    if ($user && password_verify($password, $user['password'])) {
        // Correct credentials! Create session payload
        $user_payload = [
            "id" => (string)$user['id'],
            "name" => $user['name'],
            "email" => $user['email'],
            "role" => $user['role']
        ];

        $_SESSION['user'] = $user_payload;

        sendResponse(true, $user_payload, "Login successful.");
    } else {
        // Return unauthorized generic message to prevent account discovery
        sendResponse(false, null, "Incorrect email or password.", 401);
    }

} catch (PDOException $e) {
    error_log("Login query failure: " . $e->getMessage());
    sendResponse(false, null, "A database error occurred. Please try again later.", 500);
}
?>
