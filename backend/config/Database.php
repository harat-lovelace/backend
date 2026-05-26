<?php
/**
 * DATABASE CONNECTION CLASS
 * 
 * This class handles all database connections and provides methods
 * for executing queries with prepared statements to prevent SQL injection.
 * 
 * @category Database
 * @package LaundrySystem
 */

class Database {
    private $connection;
    private $statement;

    /**
     * Constructor - Establishes database connection
     * 
     * Uses MySQLi with error handling and proper charset configuration
     */
    public function __construct() {
        try {
            // Create connection using MySQLi
            $this->connection = new mysqli(
                DB_HOST,
                DB_USER,
                DB_PASS,
                DB_NAME
            );

            // Check connection
            if ($this->connection->connect_error) {
                throw new Exception(
                    "Database Connection Failed: " . $this->connection->connect_error
                );
            }

            // Set charset to UTF-8 for proper character encoding
            $this->connection->set_charset("utf8mb4");

            // Enable error mode for better debugging
            $this->connection->report_mode = MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT;

        } catch (Exception $e) {
            // Log error and return user-friendly message
            error_log("Database Error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Database connection failed. Please try again later.'
            ]);
            exit();
        }
    }

    /**
     * Prepare and execute a query with parameters (prevents SQL injection)
     * 
     * @param string $query SQL query with placeholders (?)
     * @param array $params Parameters to bind to the query
     * @param string $types Data types for parameters (i=integer, s=string, d=double, b=blob)
     * @return bool|mysqli_result Query result or false on error
     * 
     * @example
     * $db->query("SELECT * FROM users WHERE email = ?", [$email], "s");
     */
    public function query($query, $params = [], $types = "") {
        try {
            // Prepare the statement
            $this->statement = $this->connection->prepare($query);

            if (!$this->statement) {
                throw new Exception("Prepare failed: " . $this->connection->error);
            }

            // Bind parameters if provided
            if (!empty($params)) {
                // Auto-detect types if not provided
                if (empty($types)) {
                    $types = $this->detectTypes($params);
                }

                // Call bind_param with unpacked parameters
                $this->statement->bind_param($types, ...$params);
            }

            // Execute the statement
            $this->statement->execute();

            return $this->statement;

        } catch (Exception $e) {
            error_log("Query Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get all results from a query
     * 
     * @param string $query SQL query
     * @param array $params Parameters for the query
     * @param string $types Data types for parameters
     * @return array Array of results or empty array on error
     */
    public function getResults($query, $params = [], $types = "") {
        $this->query($query, $params, $types);

        if (!$this->statement) {
            return [];
        }

        $result = $this->statement->get_result();
        $data = [];

        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }

        return $data;
    }

    /**
     * Get a single row from a query
     * 
     * @param string $query SQL query
     * @param array $params Parameters for the query
     * @param string $types Data types for parameters
     * @return array|null Single row as associative array or null
     */
    public function getRow($query, $params = [], $types = "") {
        $this->query($query, $params, $types);

        if (!$this->statement) {
            return null;
        }

        $result = $this->statement->get_result();
        return $result->fetch_assoc();
    }

    /**
     * Get a single value from a query (scalar result)
     * 
     * @param string $query SQL query
     * @param array $params Parameters for the query
     * @param string $types Data types for parameters
     * @return mixed Single value or null
     */
    public function getValue($query, $params = [], $types = "") {
        $row = $this->getRow($query, $params, $types);
        if ($row) {
            return array_values($row)[0] ?? null;
        }
        return null;
    }

    /**
     * Execute an INSERT, UPDATE, or DELETE query
     * 
     * @param string $query SQL query
     * @param array $params Parameters for the query
     * @param string $types Data types for parameters
     * @return bool True if successful, false otherwise
     */
    public function execute($query, $params = [], $types = "") {
        $this->query($query, $params, $types);
        return $this->statement !== false;
    }

    /**
     * Get the ID of the last inserted row
     * 
     * @return int Last insert ID
     */
    public function lastInsertId() {
        return $this->connection->insert_id;
    }

    /**
     * Get the number of affected rows in the last query
     * 
     * @return int Number of affected rows
     */
    public function affectedRows() {
        return $this->connection->affected_rows;
    }

    /**
     * Begin a transaction
     * 
     * @return bool True if transaction started successfully
     */
    public function beginTransaction() {
        return $this->connection->begin_transaction();
    }

    /**
     * Commit a transaction
     * 
     * @return bool True if transaction committed successfully
     */
    public function commit() {
        return $this->connection->commit();
    }

    /**
     * Rollback a transaction
     * 
     * @return bool True if transaction rolled back successfully
     */
    public function rollback() {
        return $this->connection->rollback();
    }

    /**
     * Close the database connection
     * 
     * @return bool True if connection closed successfully
     */
    public function close() {
        return $this->connection->close();
    }

    /**
     * Detect parameter types automatically
     * 
     * @param array $params Parameters to detect types for
     * @return string Type string for bind_param (i, s, d, b)
     * @private
     */
    private function detectTypes($params) {
        $types = "";
        foreach ($params as $param) {
            if (is_int($param)) {
                $types .= "i";
            } elseif (is_float($param)) {
                $types .= "d";
            } elseif (is_string($param)) {
                $types .= "s";
            } else {
                $types .= "s";
            }
        }
        return $types;
    }

    /**
     * Get connection object for advanced operations
     * 
     * @return mysqli Database connection object
     */
    public function getConnection() {
        return $this->connection;
    }
}
