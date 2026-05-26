<?php
$hosts = ['127.0.0.1', 'localhost'];
$db_name = "laundry_db";
$username = "root";
$password = "";

foreach ($hosts as $host) {
    try {
        echo "Testing connection to $host...\n";
        $dsn = "mysql:host=$host;dbname=$db_name;charset=utf8mb4";
        $conn = new PDO($dsn, $username, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);
        echo "Success connecting to $host!\n\n";
    } catch (PDOException $e) {
        echo "Failed connecting to $host: " . $e->getMessage() . "\n\n";
    }
}

// Test without dbname first, in case the database doesn't exist
foreach ($hosts as $host) {
    try {
        echo "Testing connection to $host (without dbname)...\n";
        $dsn = "mysql:host=$host;charset=utf8mb4";
        $conn = new PDO($dsn, $username, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);
        echo "Success connecting to $host without dbname!\n\n";
    } catch (PDOException $e) {
        echo "Failed: " . $e->getMessage() . "\n\n";
    }
}
?>
