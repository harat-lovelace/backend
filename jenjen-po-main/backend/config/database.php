<?php
/**
 * Database Connection Wrapper using PDO
 * Enforces prepared statements and secure connection guidelines
 */

class Database {
    // Database credentials configuration
    private $host = "localhost";
    private $db_name = "laundry_db";
    private $username = "root";
    private $password = ""; // Default empty password for XAMPP / Laragon
    private $conn = null;

    /**
     * Establish a secure PDO connection
     * @return PDO|null
     */
    public function getConnection() {
        $this->conn = null;

        try {
            // Establish Connection with UTF-8 support
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4";
            
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Error modes
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // Fetch associative arrays
                PDO::ATTR_EMULATE_PREPARES   => false,                  // Enforce actual prepared statements
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"     // Set connection charset
            ];

            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
            
        } catch (PDOException $exception) {
            // Output generic error and log detailed message for safety
            error_log("Database connection failure: " . $exception->getMessage());
            
            header('Content-Type: application/json; charset=UTF-8');
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Database connection error. Please ensure MySQL is running."
            ]);
            exit;
        }

        return $this->conn;
    }
}
?>
