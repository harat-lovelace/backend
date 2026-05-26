<?php
/**
 * API ROUTER
 *
 * Main routing file for the laundry management backend.
 * Routes requests to the appropriate controller endpoint.
 *
 * @category Routes
 * @package LaundrySystem
 */

// Include bootstrap and dependencies
require_once(__DIR__ . '/../init.php');

// Set response header
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: ' . (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], ALLOWED_ORIGINS) ? $_SERVER['HTTP_ORIGIN'] : ALLOWED_ORIGINS[0]));
header('Access-Control-Allow-Methods: ' . ALLOWED_METHODS);
header('Access-Control-Allow-Headers: ' . ALLOWED_HEADERS);
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Parse the request URL
$request = parse_url($_SERVER['REQUEST_URI']);
$path = $request['path'];

// Remove the base API path from the URL
$basePath = '/jenjen-po-main/backend';
$path = str_replace($basePath, '', $path);
$path = trim($path, '/');

// Split the path into segments
$segments = explode('/', $path);

// Get the API version and endpoint
$version = $segments[0] ?? '';
$endpoint = $segments[1] ?? '';
$method = $segments[2] ?? '';
$id = $segments[3] ?? null;

// For backward compatibility, route without /api prefix
if ($version === 'api') {
    $endpoint = $segments[1] ?? '';
    $method = $segments[2] ?? '';
    $id = $segments[3] ?? null;
}

// Route requests
if (empty($endpoint)) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Laundry Management System API',
        'version' => API_VERSION,
        'endpoints' => [
            'auth' => [
                'POST /api/auth/signup' => 'Register a new user',
                'POST /api/auth/login' => 'Login with email and password',
                'GET /api/auth/me' => 'Get current user info (requires token)'
            ],
            'orders' => [
                'POST /api/orders' => 'Create a new order',
                'GET /api/orders' => 'List all orders (with pagination)',
                'GET /api/orders?id={id}' => 'Get a single order',
                'PUT /api/orders?id={id}' => 'Update an order',
                'DELETE /api/orders?id={id}' => 'Delete an order',
                'GET /api/orders/search?q={term}' => 'Search orders'
            ],
            'bookings' => [
                'POST /api/bookings' => 'Create a new booking',
                'GET /api/bookings' => 'List all bookings',
                'GET /api/bookings?id={id}' => 'Get a single booking',
                'PUT /api/bookings?id={id}' => 'Update a booking',
                'DELETE /api/bookings?id={id}' => 'Delete a booking',
                'GET /api/bookings/availability?date={date}' => 'Check slot availability'
            ]
        ]
    ]);
    exit();
}

try {
    switch ($endpoint) {
        case 'auth':
            if ($method === 'signup') {
                require(__DIR__ . '/../controllers/auth/signup.php');
            } elseif ($method === 'login') {
                require(__DIR__ . '/../controllers/auth/login.php');
            } elseif ($method === 'me') {
                require(__DIR__ . '/../controllers/auth/me.php');
            } else {
                Response::notFound('Authentication endpoint not found');
            }
            break;

        case 'orders':
            if (isset($_GET['q'])) {
                require(__DIR__ . '/../controllers/orders/search.php');
            } elseif (isset($_GET['id'])) {
                if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                    require(__DIR__ . '/../controllers/orders/get.php');
                } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
                    require(__DIR__ . '/../controllers/orders/update.php');
                } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
                    require(__DIR__ . '/../controllers/orders/delete.php');
                } else {
                    Response::methodNotAllowed();
                }
            } else {
                if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                    require(__DIR__ . '/../controllers/orders/list.php');
                } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
                    require(__DIR__ . '/../controllers/orders/create.php');
                } else {
                    Response::methodNotAllowed();
                }
            }
            break;

        case 'bookings':
            if (isset($_GET['date'])) {
                require(__DIR__ . '/../controllers/bookings/availability.php');
            } elseif (isset($_GET['id'])) {
                if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                    require(__DIR__ . '/../controllers/bookings/get.php');
                } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
                    require(__DIR__ . '/../controllers/bookings/update.php');
                } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
                    require(__DIR__ . '/../controllers/bookings/delete.php');
                } else {
                    Response::methodNotAllowed();
                }
            } else {
                if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                    require(__DIR__ . '/../controllers/bookings/list.php');
                } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
                    require(__DIR__ . '/../controllers/bookings/create.php');
                } else {
                    Response::methodNotAllowed();
                }
            }
            break;

        default:
            Response::notFound('Endpoint not found');
            break;
    }
} catch (Exception $e) {
    error_log('Router Error: ' . $e->getMessage());
    Response::serverError('An error occurred while processing your request');
}
