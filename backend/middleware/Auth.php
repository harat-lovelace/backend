<?php
/**
 * JWT AUTHENTICATION MIDDLEWARE
 * 
 * Handles JWT token verification and user authentication
 * for protected API endpoints
 * 
 * @category Middleware
 * @package LaundrySystem
 */

class Auth {
    /**
     * Verify JWT token from Authorization header
     * 
     * @return array|false User data if token is valid, false otherwise
     */
    public static function verifyToken() {
        // Get authorization header
        $headers = getallheaders();
        $token = null;

        if (isset($headers['Authorization'])) {
            $matches = [];
            if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
                $token = $matches[1];
            }
        }

        // Check if token exists
        if (!$token) {
            return false;
        }

        // Verify token
        return self::validateToken($token);
    }

    /**
     * Generate JWT token
     * 
     * @param array $payload Data to encode in token
     * @param int $expiresIn Token expiration time in seconds
     * @return string JWT token
     */
    public static function generateToken($payload, $expiresIn = JWT_EXPIRATION) {
        // Header
        $header = [
            'alg' => 'HS256',
            'typ' => 'JWT'
        ];

        // Payload with expiration
        $payload['iat'] = time();
        $payload['exp'] = time() + $expiresIn;

        // Encode header and payload
        $header = base64_encode(json_encode($header));
        $payload = base64_encode(json_encode($payload));

        // Create signature
        $signature = hash_hmac(
            'sha256',
            "$header.$payload",
            JWT_SECRET,
            true
        );
        $signature = base64_encode($signature);

        // Return complete token
        return "$header.$payload.$signature";
    }

    /**
     * Validate JWT token
     * 
     * @param string $token JWT token to validate
     * @return array|false Decoded payload if valid, false otherwise
     */
    public static function validateToken($token) {
        try {
            // Split token into parts
            $parts = explode('.', $token);
            if (count($parts) !== 3) {
                return false;
            }

            $header = $parts[0];
            $payload = $parts[1];
            $signature = $parts[2];

            // Verify signature
            $expectedSignature = base64_encode(
                hash_hmac(
                    'sha256',
                    "$header.$payload",
                    JWT_SECRET,
                    true
                )
            );

            if ($signature !== $expectedSignature) {
                return false;
            }

            // Decode payload
            $decoded = json_decode(base64_decode($payload), true);

            // Check expiration
            if (isset($decoded['exp']) && $decoded['exp'] < time()) {
                return false;
            }

            return $decoded;

        } catch (Exception $e) {
            error_log("Token Validation Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Check if user has admin role
     * 
     * @param array $user User data from token
     * @return bool True if user is admin
     */
    public static function isAdmin($user) {
        return isset($user['role']) && $user['role'] === 'admin';
    }

    /**
     * Check if user has customer role
     * 
     * @param array $user User data from token
     * @return bool True if user is customer
     */
    public static function isCustomer($user) {
        return isset($user['role']) && $user['role'] === 'customer';
    }

    /**
     * Require authentication for an endpoint
     * Returns error response if not authenticated
     * 
     * @return array User data if authenticated
     */
    public static function requireAuth() {
        $user = self::verifyToken();

        if (!$user) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Unauthorized: Invalid or missing token'
            ]);
            exit();
        }

        return $user;
    }

    /**
     * Require admin role
     * Returns error response if user is not admin
     * 
     * @return array User data if authorized
     */
    public static function requireAdmin() {
        $user = self::requireAuth();

        if (!self::isAdmin($user)) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Forbidden: Admin access required'
            ]);
            exit();
        }

        return $user;
    }
}
