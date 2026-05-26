<?php
/**
 * HELPER FUNCTIONS
 * 
 * Collection of useful helper functions for the application
 * 
 * @category Utilities
 * @package LaundrySystem
 */

/**
 * Format date for display
 * 
 * @param string $date Date string (YYYY-MM-DD)
 * @param string $format Output format
 * @return string Formatted date
 */
function formatDate($date, $format = 'm/d/Y') {
    $timestamp = strtotime($date);
    return date($format, $timestamp);
}

/**
 * Format datetime for display
 * 
 * @param string $datetime DateTime string
 * @param string $format Output format
 * @return string Formatted datetime
 */
function formatDateTime($datetime, $format = 'm/d/Y h:i A') {
    $timestamp = strtotime($datetime);
    return date($format, $timestamp);
}

/**
 * Generate a random string
 * 
 * @param int $length Length of string to generate
 * @return string Random string
 */
function generateRandomString($length = 32) {
    return bin2hex(random_bytes($length / 2));
}

/**
 * Get client IP address
 * 
 * @return string Client IP address
 */
function getClientIp() {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
    } else {
        $ip = $_SERVER['REMOTE_ADDR'];
    }
    return $ip;
}

/**
 * Check if a string is a valid UUID
 * 
 * @param string $uuid UUID to validate
 * @return bool
 */
function isValidUuid($uuid) {
    $pattern = '/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i';
    return preg_match($pattern, $uuid) === 1;
}

/**
 * Generate UUID v4
 * 
 * @return string UUID v4
 */
function generateUuid() {
    return sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

/**
 * Calculate age from birthdate
 * 
 * @param string $birthdate Birthdate (YYYY-MM-DD)
 * @return int Age in years
 */
function calculateAge($birthdate) {
    $birthDate = new DateTime($birthdate);
    $today = new DateTime('today');
    return $birthDate->diff($today)->y;
}

/**
 * Convert bytes to human readable format
 * 
 * @param int $bytes Bytes to convert
 * @param int $precision Decimal precision
 * @return string Human readable format
 */
function bytesToHuman($bytes, $precision = 2) {
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    
    for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
        $bytes /= 1024;
    }
    
    return round($bytes, $precision) . ' ' . $units[$i];
}

/**
 * Truncate string to specified length
 * 
 * @param string $string String to truncate
 * @param int $length Maximum length
 * @param string $suffix Suffix to append if truncated
 * @return string Truncated string
 */
function truncateString($string, $length = 100, $suffix = '...') {
    if (strlen($string) <= $length) {
        return $string;
    }
    return substr($string, 0, $length - strlen($suffix)) . $suffix;
}

/**
 * Convert camelCase to snake_case
 * 
 * @param string $string String to convert
 * @return string snake_case string
 */
function camelToSnake($string) {
    return strtolower(preg_replace('/[A-Z]/', '_$0', $string));
}

/**
 * Convert snake_case to camelCase
 * 
 * @param string $string String to convert
 * @return string camelCase string
 */
function snakeToCamel($string) {
    return lcfirst(str_replace('_', '', ucwords($string, '_')));
}

/**
 * Check if array is associative
 * 
 * @param array $array Array to check
 * @return bool True if associative array
 */
function isAssociativeArray($array) {
    return count(array_filter(array_keys($array), 'is_string')) > 0;
}

/**
 * Deep merge arrays
 * 
 * @param array $array1 First array
 * @param array $array2 Second array
 * @return array Merged array
 */
function deepMergeArrays($array1, $array2) {
    foreach ($array2 as $key => $value) {
        if (is_array($value) && isset($array1[$key]) && is_array($array1[$key])) {
            $array1[$key] = deepMergeArrays($array1[$key], $value);
        } else {
            $array1[$key] = $value;
        }
    }
    return $array1;
}

/**
 * Log custom message
 * 
 * @param string $message Message to log
 * @param string $level Log level (info, warning, error)
 * @return void
 */
function logMessage($message, $level = 'info') {
    $logFile = __DIR__ . '/logs/app.log';
    
    // Create logs directory if it doesn't exist
    if (!is_dir(dirname($logFile))) {
        mkdir(dirname($logFile), 0755, true);
    }
    
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[$timestamp] [$level] $message" . PHP_EOL;
    
    file_put_contents($logFile, $logEntry, FILE_APPEND);
}

/**
 * Get previous page URL
 * 
 * @return string Previous page URL or home
 */
function getPreviousUrl() {
    return $_SERVER['HTTP_REFERER'] ?? '/';
}

/**
 * Check if current page matches given path
 * 
 * @param string $path Path to check
 * @return bool
 */
function isCurrentPage($path) {
    return $_SERVER['REQUEST_URI'] === $path;
}

/**
 * Safe JSON decode
 * 
 * @param string $json JSON string
 * @param bool $assoc Return associative array
 * @return mixed Decoded JSON or null on error
 */
function safeJsonDecode($json, $assoc = true) {
    $decoded = json_decode($json, $assoc);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log('JSON Decode Error: ' . json_last_error_msg());
        return null;
    }
    
    return $decoded;
}

/**
 * Send email (stub for future use)
 * 
 * @param string $to Recipient email
 * @param string $subject Email subject
 * @param string $message Email message
 * @param array $headers Additional headers
 * @return bool
 */
function sendEmail($to, $subject, $message, $headers = []) {
    // This is a stub function
    // Implement SMTP or use PHPMailer in production
    
    $defaultHeaders = [
        'From' => FROM_EMAIL,
        'Content-Type' => 'text/html; charset=UTF-8'
    ];
    
    $allHeaders = array_merge($defaultHeaders, $headers);
    $headerString = '';
    foreach ($allHeaders as $key => $value) {
        $headerString .= $key . ': ' . $value . "\r\n";
    }
    
    return mail($to, $subject, $message, $headerString);
}
