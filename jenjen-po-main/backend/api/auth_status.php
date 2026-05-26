<?php
/**
 * Authentication Status API Endpoint
 * Checks if the current session is authenticated and returns the user payload
 */

// Load global configuration
require_once __DIR__ . '/../config/config.php';

if (isset($_SESSION['user'])) {
    sendResponse(true, $_SESSION['user'], "User is authenticated.");
} else {
    sendResponse(false, null, "User is not authenticated.", 401);
}
?>
