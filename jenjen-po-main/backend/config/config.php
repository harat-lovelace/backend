<?php
/**
 * Global Configuration and CORS Settings
 * Sets up sessions, handles CORS Preflight OPTIONS requests, and provides response helpers
 */

// Enable session support
if (session_status() === PHP_SESSION_NONE) {
    // Configure secure session cookie settings
    session_set_cookie_params([
        'lifetime' => 86400, // 1 day
        'path' => '/',
        'secure' => false,   // Set to true if using HTTPS
        'httponly' => true,  // Prevent JavaScript access to session cookie
        'samesite' => 'Lax'
    ]);
    session_start();
}

// CORS Configuration - Detect Origin dynamically for local development
$allowed_origins = [
    'http://localhost:5173', // Vite development server
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://localhost'       // Standard Apache port
];

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

if (in_array($origin, $allowed_origins) || empty($origin)) {
    header("Access-Control-Allow-Origin: " . ($origin ? $origin : '*'));
} else {
    // Fallback if not specifically listed, but let's allow it in local dev
    header("Access-Control-Allow-Origin: *");
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Handle preflight OPTIONS requests immediately
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Set JSON output header by default
header('Content-Type: application/json; charset=UTF-8');

/**
 * Send JSON response and exit
 * @param bool $success
 * @param mixed $data
 * @param string|null $message
 * @param int $http_code
 */
function sendResponse($success, $data = null, $message = null, $http_code = 200) {
    http_response_code($http_code);
    
    $response = [
        "success" => $success
    ];
    
    if ($message !== null) {
        $response["message"] = $message;
    }
    
    if ($data !== null) {
        $response["data"] = $data;
    }
    
    echo json_encode($response);
    exit;
}

/**
 * Securely retrieve and parse raw JSON input body
 * @return array
 */
function getJsonInput() {
    $raw_input = file_get_contents("php://input");
    $decoded = json_decode($raw_input, true);
    return is_array($decoded) ? $decoded : [];
}

/**
 * Sanitize variables for general output
 * @param string $data
 * @return string
 */
function sanitizeInput($data) {
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

/**
 * Global helper to insert a notification for a user
 * @param PDO $db
 * @param int|string|null $user_id
 * @param string $user_email
 * @param string $message
 */
function createNotification($db, $user_id, $user_email, $message) {
    try {
        $parsed_id = null;
        if (!empty($user_id) && $user_id !== 'guest' && $user_id !== 'admin-created') {
            $parsed_id = intval(str_replace('USER-', '', $user_id));
        }
        
        $query = "INSERT INTO notifications (user_id, user_email, message, is_read) VALUES (:user_id, :user_email, :message, 0)";
        $stmt = $db->prepare($query);
        $stmt->execute([
            ':user_id' => $parsed_id,
            ':user_email' => $user_email,
            ':message' => $message
        ]);
    } catch (PDOException $e) {
        error_log("Failed to insert notification: " . $e->getMessage());
    }
}
?>
