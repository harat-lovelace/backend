<?php
/**
 * HEALTH CHECK ENDPOINT
 * 
 * GET /health
 * 
 * Returns the health status of the backend server
 * 
 * @category API
 * @package LaundrySystem
 */

// Bootstrap application
require_once(__DIR__ . '/../init.php');

// Set response header
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: ' . (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], ALLOWED_ORIGINS) ? $_SERVER['HTTP_ORIGIN'] : ALLOWED_ORIGINS[0]));
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check request method
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit();
}

// Check database connection
$db = new Database();
$dbConnected = true;

try {
    // Test a simple query
    $result = $db->query("SELECT 1");
} catch (Exception $e) {
    $dbConnected = false;
}

// Return health status
http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Backend connected',
    'status' => 'healthy',
    'timestamp' => date('Y-m-d H:i:s'),
    'database' => $dbConnected ? 'connected' : 'disconnected',
    'version' => API_VERSION
]);
