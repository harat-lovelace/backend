<?php
/**
 * RESPONSE UTILITY CLASS
 * 
 * Provides standardized response formatting for all API endpoints
 * Ensures consistent JSON response structure across the application
 * 
 * @category Utilities
 * @package LaundrySystem
 */

class Response {
    /**
     * Send success response
     * 
     * @param mixed $data Response data
     * @param string $message Success message
     * @param int $statusCode HTTP status code (default: 200)
     * @return void
     * 
     * @example
     * Response::success(['id' => 1, 'name' => 'John'], 'User created successfully', 201);
     */
    public static function success($data = null, $message = 'Success', $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit();
    }

    /**
     * Send error response
     * 
     * @param string $message Error message
     * @param int $statusCode HTTP status code (default: 400)
     * @param mixed $errors Additional error details
     * @return void
     * 
     * @example
     * Response::error('Validation failed', 422, ['email' => 'Invalid email format']);
     */
    public static function error($message = 'Error', $statusCode = 400, $errors = null) {
        http_response_code($statusCode);
        echo json_encode([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit();
    }

    /**
     * Send validation error response
     * 
     * @param array $errors Validation errors
     * @param string $message Error message (default: 'Validation failed')
     * @return void
     * 
     * @example
     * Response::validationError(['email' => 'Email is required', 'password' => 'Password must be at least 6 characters']);
     */
    public static function validationError($errors, $message = 'Validation failed') {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit();
    }

    /**
     * Send paginated response
     * 
     * @param array $data Array of items
     * @param int $total Total number of items
     * @param int $page Current page number
     * @param int $perPage Items per page
     * @param string $message Success message
     * @return void
     * 
     * @example
     * Response::paginated($items, 100, 1, 10, 'Users retrieved successfully');
     */
    public static function paginated($data, $total, $page, $perPage, $message = 'Data retrieved successfully') {
        $totalPages = ceil($total / $perPage);
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'per_page' => $perPage,
                'total_pages' => $totalPages,
                'has_next' => $page < $totalPages,
                'has_prev' => $page > 1
            ],
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit();
    }

    /**
     * Send unauthorized response
     * 
     * @param string $message Error message
     * @return void
     */
    public static function unauthorized($message = 'Unauthorized') {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => $message,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit();
    }

    /**
     * Send forbidden response
     * 
     * @param string $message Error message
     * @return void
     */
    public static function forbidden($message = 'Forbidden') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => $message,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit();
    }

    /**
     * Send not found response
     * 
     * @param string $message Error message
     * @return void
     */
    public static function notFound($message = 'Resource not found') {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => $message,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit();
    }

    /**
     * Send method not allowed response
     * 
     * @param string $message Error message
     * @return void
     */
    public static function methodNotAllowed($message = 'Method not allowed') {
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => $message,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit();
    }

    /**
     * Send server error response
     * 
     * @param string $message Error message
     * @return void
     */
    public static function serverError($message = 'Internal server error') {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => $message,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit();
    }
}
