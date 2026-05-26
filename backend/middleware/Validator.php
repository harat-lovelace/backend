<?php
/**
 * VALIDATION UTILITY CLASS
 * 
 * Provides methods for validating user input and data
 * Used across all API endpoints for consistent validation
 * 
 * @category Utilities
 * @package LaundrySystem
 */

class Validator {
    private static $errors = [];

    /**
     * Reset validation errors
     * 
     * @return void
     */
    public static function reset() {
        self::$errors = [];
    }

    /**
     * Get validation errors
     * 
     * @return array Array of validation errors
     */
    public static function getErrors() {
        return self::$errors;
    }

    /**
     * Add validation error
     * 
     * @param string $field Field name
     * @param string $message Error message
     * @return void
     */
    public static function addError($field, $message) {
        self::$errors[$field] = $message;
    }

    /**
     * Check if field is required and not empty
     * 
     * @param mixed $value Field value
     * @param string $field Field name
     * @return bool
     */
    public static function required($value, $field = '') {
        if (empty($value)) {
            self::addError($field, ucfirst($field) . ' is required');
            return false;
        }
        return true;
    }

    /**
     * Validate email format
     * 
     * @param string $email Email address
     * @param string $field Field name (default: 'email')
     * @return bool
     */
    public static function email($email, $field = 'email') {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            self::addError($field, 'Invalid email format');
            return false;
        }
        return true;
    }

    /**
     * Validate minimum length
     * 
     * @param string $value Value to check
     * @param int $minLength Minimum length
     * @param string $field Field name
     * @return bool
     */
    public static function minLength($value, $minLength, $field = '') {
        if (strlen($value) < $minLength) {
            self::addError($field, ucfirst($field) . ' must be at least ' . $minLength . ' characters');
            return false;
        }
        return true;
    }

    /**
     * Validate maximum length
     * 
     * @param string $value Value to check
     * @param int $maxLength Maximum length
     * @param string $field Field name
     * @return bool
     */
    public static function maxLength($value, $maxLength, $field = '') {
        if (strlen($value) > $maxLength) {
            self::addError($field, ucfirst($field) . ' must not exceed ' . $maxLength . ' characters');
            return false;
        }
        return true;
    }

    /**
     * Validate number is numeric
     * 
     * @param mixed $value Value to check
     * @param string $field Field name
     * @return bool
     */
    public static function numeric($value, $field = '') {
        if (!is_numeric($value)) {
            self::addError($field, ucfirst($field) . ' must be a number');
            return false;
        }
        return true;
    }

    /**
     * Validate number is positive
     * 
     * @param mixed $value Value to check
     * @param string $field Field name
     * @return bool
     */
    public static function positive($value, $field = '') {
        if ($value <= 0) {
            self::addError($field, ucfirst($field) . ' must be greater than 0');
            return false;
        }
        return true;
    }

    /**
     * Validate that two fields match
     * 
     * @param string $value1 First value
     * @param string $value2 Second value
     * @param string $field Field name
     * @return bool
     */
    public static function match($value1, $value2, $field = '') {
        if ($value1 !== $value2) {
            self::addError($field, ucfirst($field) . ' do not match');
            return false;
        }
        return true;
    }

    /**
     * Validate value is in a set of allowed values
     * 
     * @param mixed $value Value to check
     * @param array $allowed Allowed values
     * @param string $field Field name
     * @return bool
     */
    public static function inArray($value, $allowed, $field = '') {
        if (!in_array($value, $allowed)) {
            self::addError($field, 'Invalid value for ' . $field);
            return false;
        }
        return true;
    }

    /**
     * Validate phone number format
     * 
     * @param string $phone Phone number
     * @param string $field Field name
     * @return bool
     */
    public static function phone($phone, $field = 'phone') {
        // Remove non-numeric characters
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
        
        // Check if phone is between 7 and 15 digits
        if (strlen($cleanPhone) < 7 || strlen($cleanPhone) > 15) {
            self::addError($field, 'Invalid phone number format');
            return false;
        }
        return true;
    }

    /**
     * Validate date format (YYYY-MM-DD)
     * 
     * @param string $date Date string
     * @param string $field Field name
     * @return bool
     */
    public static function date($date, $field = 'date') {
        $dateTime = DateTime::createFromFormat('Y-m-d', $date);
        
        if (!$dateTime || $dateTime->format('Y-m-d') !== $date) {
            self::addError($field, 'Invalid date format. Use YYYY-MM-DD');
            return false;
        }
        return true;
    }

    /**
     * Validate date is not in the past
     * 
     * @param string $date Date string (YYYY-MM-DD)
     * @param string $field Field name
     * @return bool
     */
    public static function futureDate($date, $field = 'date') {
        if (strtotime($date) < strtotime('today')) {
            self::addError($field, 'Date cannot be in the past');
            return false;
        }
        return true;
    }

    /**
     * Validate date is within a range
     * 
     * @param string $date Date string (YYYY-MM-DD)
     * @param string $startDate Start date (YYYY-MM-DD)
     * @param string $endDate End date (YYYY-MM-DD)
     * @param string $field Field name
     * @return bool
     */
    public static function dateRange($date, $startDate, $endDate, $field = 'date') {
        $dateTime = strtotime($date);
        $start = strtotime($startDate);
        $end = strtotime($endDate);
        
        if ($dateTime < $start || $dateTime > $end) {
            self::addError($field, 'Date must be between ' . $startDate . ' and ' . $endDate);
            return false;
        }
        return true;
    }

    /**
     * Validate JSON data
     * 
     * @param string $json JSON string
     * @param string $field Field name
     * @return bool
     */
    public static function json($json, $field = 'json') {
        json_decode($json);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            self::addError($field, 'Invalid JSON format');
            return false;
        }
        return true;
    }

    /**
     * Sanitize string input
     * 
     * @param string $input Input string
     * @return string Sanitized string
     */
    public static function sanitizeString($input) {
        // Remove extra whitespace
        $input = trim($input);
        
        // Remove HTML tags
        $input = htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
        
        return $input;
    }

    /**
     * Sanitize email input
     * 
     * @param string $email Email address
     * @return string Sanitized email
     */
    public static function sanitizeEmail($email) {
        return filter_var(trim($email), FILTER_SANITIZE_EMAIL);
    }

    /**
     * Sanitize integer input
     * 
     * @param mixed $input Input to sanitize
     * @return int Sanitized integer
     */
    public static function sanitizeInt($input) {
        return filter_var($input, FILTER_SANITIZE_NUMBER_INT);
    }

    /**
     * Sanitize float input
     * 
     * @param mixed $input Input to sanitize
     * @return float Sanitized float
     */
    public static function sanitizeFloat($input) {
        return filter_var($input, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
    }
}
