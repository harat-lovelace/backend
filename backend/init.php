<?php
/**
 * AUTOLOAD AND INITIALIZATION FILE
 * 
 * This file can be used to include all required files automatically
 * Include this file at the beginning of your scripts:
 * require_once(__DIR__ . '/init.php');
 * 
 * @category Core
 * @package LaundrySystem
 */

// Configuration
require_once(__DIR__ . '/config/constants.php');

// Database
require_once(__DIR__ . '/config/Database.php');

// Middleware
require_once(__DIR__ . '/middleware/Auth.php');
require_once(__DIR__ . '/middleware/Response.php');
require_once(__DIR__ . '/middleware/Validator.php');

// Utility functions
require_once(__DIR__ . '/utils/helpers.php');

// Error handling
set_error_handler('errorHandler');
set_exception_handler('exceptionHandler');

/**
 * Custom error handler
 */
function errorHandler($errno, $errstr, $errfile, $errline) {
    $error = [
        'type' => $errno,
        'message' => $errstr,
        'file' => $errfile,
        'line' => $errline
    ];
    
    error_log(json_encode($error));
    
    if ($errno === E_WARNING || $errno === E_NOTICE) {
        return true; // Don't execute PHP internal error handler
    }
    
    return false;
}

/**
 * Custom exception handler
 */
function exceptionHandler($exception) {
    error_log('Exception: ' . $exception->getMessage());
    Response::serverError('An unexpected error occurred');
}
