<?php
/**
 * User Profile Update API Endpoint
 * Handles POST requests to modify name, email, or password for the current user
 */

// Load global configuration and database connection
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

// Only allow authenticated users
if (!isset($_SESSION['user'])) {
    sendResponse(false, null, "Unauthorized. Please sign in.", 401);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    sendResponse(false, null, "Method not allowed. Use POST.", 405);
}

$input = getJsonInput();

$name = isset($input['name']) ? trim($input['name']) : '';
$email = isset($input['email']) ? trim($input['email']) : '';
$password = isset($input['password']) ? $input['password'] : '';

// Validation
if (empty($name)) {
    sendResponse(false, null, "Name is required.", 400);
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse(false, null, "A valid email address is required.", 400);
}

$user_id = intval(str_replace('USER-', '', $_SESSION['user']['id']));

$database = new Database();
$db = $database->getConnection();

try {
    // 1. Check if email is already in use by another user
    $check_query = "SELECT id FROM users WHERE email = :email AND id != :id LIMIT 1";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->execute([
        ':email' => $email,
        ':id' => $user_id
    ]);

    if ($check_stmt->rowCount() > 0) {
        sendResponse(false, null, "This email address is already in use by another account.", 409);
    }

    // 2. Perform Update
    if (!empty($password)) {
        if (strlen($password) < 6) {
            sendResponse(false, null, "Password must be at least 6 characters.", 400);
        }
        
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        $update_query = "UPDATE users SET name = :name, email = :email, password = :password WHERE id = :id";
        $params = [
            ':name' => $name,
            ':email' => $email,
            ':password' => $hashed_password,
            ':id' => $user_id
        ];
    } else {
        $update_query = "UPDATE users SET name = :name, email = :email WHERE id = :id";
        $params = [
            ':name' => $name,
            ':email' => $email,
            ':id' => $user_id
        ];
    }

    $update_stmt = $db->prepare($update_query);
    $update_stmt->execute($params);

    // 3. Update session payload
    $_SESSION['user']['name'] = $name;
    $_SESSION['user']['email'] = $email;

    // 4. Log notification for profile update
    createNotification($db, $_SESSION['user']['id'], $email, "Your profile information was successfully updated.");

    sendResponse(true, $_SESSION['user'], "Profile updated successfully.");

} catch (PDOException $e) {
    error_log("Profile update query failure: " . $e->getMessage());
    sendResponse(false, null, "A database error occurred. Please try again later.", 500);
}
?>
