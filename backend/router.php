<?php
/**
 * PHP Built-in Web Server Router Script
 * Used for routing API requests through index.php when running php -S
 */

$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH)
);

// If the file exists and is not a directory, serve it directly
if ($uri !== '/' && file_exists(__DIR__ . $uri) && !is_dir(__DIR__ . $uri)) {
    return false;
}

// Otherwise, route to index.php
require_once __DIR__ . '/index.php';
