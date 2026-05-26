<?php
/**
 * Laundry Orders API Endpoint
 * Handles GET, POST, PUT, DELETE requests for order management
 */

// Load global configuration and database connection
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// Helper to calculate estimated pickup date (3 days from now, skipping Sundays if desired)
function calculateEstimatedPickup() {
    $now = time();
    $threeDays = $now + (3 * 24 * 60 * 60);
    return date('Y-m-d', $threeDays);
}

// -------------------------------------------------------------
// GET: Retrieve, Search and Filter Orders
// -------------------------------------------------------------
if ($method === 'GET') {
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $user_id = isset($_GET['userId']) ? trim($_GET['userId']) : '';
    
    try {
        $query = "SELECT * FROM orders WHERE 1=1";
        $params = [];
        
        // Filter by user ID if provided
        if (!empty($user_id)) {
            // Check if guest or specific user
            if ($user_id === 'guest') {
                $query .= " AND user_id IS NULL";
            } else {
                $query .= " AND user_id = :user_id";
                $params[':user_id'] = intval($user_id);
            }
        }
        
        // Filter by search term (searches customer name, email, or order ID)
        if (!empty($search)) {
            $query .= " AND (id LIKE :search OR customer_name LIKE :search_name)";
            $params[':search'] = "%$search%";
            $params[':search_name'] = "%$search%";
        }
        
        $query .= " ORDER BY created_at DESC";
        
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $orders = $stmt->fetchAll();
        
        // Format dates and boolean for JSON compatibility
        foreach ($orders as &$order) {
            $order['notificationRead'] = (bool)$order['notification_read'];
            $order['customerName'] = $order['customer_name'];
            $order['contactNumber'] = $order['contact_number'];
            $order['laundryType'] = $order['laundry_type'];
            $order['specialInstructions'] = $order['special_instructions'];
            $order['userId'] = (string)$order['user_id'];
            $order['userEmail'] = $order['user_email'];
            $order['estimatedPickup'] = date('m/d/Y', strtotime($order['estimated_pickup']));
            $order['createdAt'] = $order['created_at'];
            
            // Format image web path
            if (!empty($order['image_path'])) {
                $order['imagePath'] = 'backend/' . $order['image_path'];
            } else {
                $order['imagePath'] = null;
            }
        }
        
        sendResponse(true, $orders, "Orders retrieved successfully.");
        
    } catch (PDOException $e) {
        error_log("GET orders query failure: " . $e->getMessage());
        sendResponse(false, null, "Failed to retrieve orders.", 500);
    }
}

// -------------------------------------------------------------
// POST: Create a new order OR Handle updates/deletes via action param
// -------------------------------------------------------------
if ($method === 'POST') {
    // Check if updating/deleting via action (useful when client cannot send raw PUT/DELETE)
    $action = isset($_POST['action']) ? trim($_POST['action']) : '';
    if (empty($action)) {
        // Check JSON body for action if form-data isn't used
        $json = getJsonInput();
        $action = isset($json['action']) ? trim($json['action']) : '';
    }
    
    // -- ROUTE TO UPDATE / DELETE --
    if ($action === 'update_status' || $action === 'advance' || $action === 'dismiss_notification') {
        handleUpdate($db, $action);
    } elseif ($action === 'delete' || $action === 'cancel') {
        handleDelete($db);
    }
    
    // -- OTHERWISE: CREATE NEW ORDER --
    $customer_name = isset($_POST['customerName']) ? trim($_POST['customerName']) : '';
    $contact_number = isset($_POST['contactNumber']) ? trim($_POST['contactNumber']) : '';
    $laundry_type = isset($_POST['laundryType']) ? trim($_POST['laundryType']) : '';
    $weight = isset($_POST['weight']) ? floatval($_POST['weight']) : 0.0;
    $special_instructions = isset($_POST['specialInstructions']) ? trim($_POST['specialInstructions']) : '';
    $user_id = isset($_POST['userId']) ? trim($_POST['userId']) : null;
    $user_email = isset($_POST['userEmail']) ? trim($_POST['userEmail']) : '';

    if (empty($customer_name) || empty($contact_number) || empty($laundry_type) || $weight <= 0.0) {
        sendResponse(false, null, "Missing or invalid required fields.", 400);
    }

    // Handle File Upload securely
    $image_path = null;
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $file_tmp = $_FILES['image']['tmp_name'];
        $file_name = $_FILES['image']['name'];
        $file_size = $_FILES['image']['size'];
        $file_type = $_FILES['image']['type'];
        
        // 1. Validate File Size (max 5MB)
        if ($file_size > 5 * 1024 * 1024) {
            sendResponse(false, null, "File is too large. Max size is 5MB.", 400);
        }
        
        // 2. Validate Extensions and MIME type
        $allowed_extensions = ['jpg', 'jpeg', 'png', 'webp'];
        $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
        
        $allowed_mimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        
        if (!in_array($file_ext, $allowed_extensions) || !in_array($file_type, $allowed_mimes)) {
            sendResponse(false, null, "Invalid file type. Only JPG, PNG, and WEBP images are allowed.", 400);
        }
        
        // 3. Setup uploads directory securely
        $upload_dir = __DIR__ . '/../uploads/';
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0755, true);
        }
        
        // 4. Generate unique name to prevent collisions and directory traversal
        $unique_filename = uniqid('garment_', true) . '.' . $file_ext;
        $dest_path = $upload_dir . $unique_filename;
        
        if (move_uploaded_file($file_tmp, $dest_path)) {
            $image_path = 'uploads/' . $unique_filename;
        } else {
            error_log("Failed to move uploaded file.");
        }
    }

    try {
        // Generate Unique Order ID atomically (LDY-XXXX)
        $db->beginTransaction();
        
        $stmt = $db->query("SELECT MAX(CAST(SUBSTRING(id, 5) AS UNSIGNED)) AS max_num FROM orders WHERE id LIKE 'LDY-%'");
        $max_num = $stmt->fetchColumn();
        $next_num = ($max_num ? intval($max_num) : 0) + 1;
        
        $new_id = "LDY-" . str_pad($next_num, 4, "0", STR_PAD_LEFT);
        $estimated_pickup = calculateEstimatedPickup();
        
        // Setup numeric user ID mapping
        $parsed_user_id = null;
        if (!empty($user_id) && $user_id !== 'guest' && $user_id !== 'admin-created') {
            $parsed_user_id = intval(str_replace('USER-', '', $user_id));
        }

        $query = "INSERT INTO orders (id, customer_name, contact_number, laundry_type, weight, special_instructions, image_path, user_id, user_email, status, estimated_pickup, notification_read) 
                  VALUES (:id, :customer_name, :contact_number, :laundry_type, :weight, :special_instructions, :image_path, :user_id, :user_email, 'Order Submitted', :estimated_pickup, 0)";
        
        $stmt = $db->prepare($query);
        $stmt->execute([
            ':id' => $new_id,
            ':customer_name' => $customer_name,
            ':contact_number' => $contact_number,
            ':laundry_type' => $laundry_type,
            ':weight' => $weight,
            ':special_instructions' => $special_instructions,
            ':image_path' => $image_path,
            ':user_id' => $parsed_user_id,
            ':user_email' => $user_email,
            ':estimated_pickup' => $estimated_pickup
        ]);
        
        // Create order submission notification
        createNotification($db, $user_id, $user_email, "Order $new_id has been placed successfully.");
        
        $db->commit();
        
        sendResponse(true, ["orderId" => $new_id], "Order submitted successfully.", 201);
        
    } catch (PDOException $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        error_log("Order creation query failure: " . $e->getMessage());
        sendResponse(false, null, "Failed to create order.", 500);
    }
}

// -------------------------------------------------------------
// UPDATE FUNCTION
// -------------------------------------------------------------
function handleUpdate($db, $action) {
    // Support JSON or Form Data inputs
    $input = getJsonInput();
    $order_id = isset($input['orderId']) ? trim($input['orderId']) : (isset($_POST['orderId']) ? trim($_POST['orderId']) : '');
    
    if (empty($order_id)) {
        sendResponse(false, null, "Order ID is required for updates.", 400);
    }
    
    try {
        if ($action === 'dismiss_notification') {
            $query = "UPDATE orders SET notification_read = 1 WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->execute([':id' => $order_id]);
            sendResponse(true, null, "Notification marked as read.");
        }
        
        if ($action === 'update_status') {
            $status = isset($input['status']) ? trim($input['status']) : (isset($_POST['status']) ? trim($_POST['status']) : '');
            
            $valid_statuses = [
                'Order Submitted', 
                'Order Accepted', 
                'Pickup Scheduled', 
                'Laundry Picked Up', 
                'Washing', 
                'Drying', 
                'Folding', 
                'Ready for Delivery', 
                'Completed'
            ];
            if (!in_array($status, $valid_statuses)) {
                sendResponse(false, null, "Invalid status stage.", 400);
            }
            
            $query = "UPDATE orders SET status = :status WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->execute([':status' => $status, ':id' => $order_id]);
            
            // Log notification for status update
            $info_stmt = $db->prepare("SELECT user_id, user_email FROM orders WHERE id = :id LIMIT 1");
            $info_stmt->execute([':id' => $order_id]);
            $order_info = $info_stmt->fetch();
            if ($order_info) {
                createNotification($db, $order_info['user_id'], $order_info['user_email'], "Order $order_id status has been updated to: $status.");
            }
            
            sendResponse(true, null, "Order status updated to $status.");
        }
        
        if ($action === 'advance') {
            // Retrieve current status
            $get_query = "SELECT status FROM orders WHERE id = :id LIMIT 1";
            $get_stmt = $db->prepare($get_query);
            $get_stmt->execute([':id' => $order_id]);
            $current_status = $get_stmt->fetchColumn();
            
            if (!$current_status) {
                sendResponse(false, null, "Order not found.", 404);
            }
            
            $next_stages = [
                'Order Submitted' => 'Order Accepted',
                'Order Accepted' => 'Pickup Scheduled',
                'Pickup Scheduled' => 'Laundry Picked Up',
                'Laundry Picked Up' => 'Washing',
                'Washing' => 'Drying',
                'Drying' => 'Folding',
                'Folding' => 'Ready for Delivery',
                'Ready for Delivery' => 'Completed',
                'Completed' => null
            ];
            
            $next_status = $next_stages[$current_status];
            
            if ($next_status) {
                $query = "UPDATE orders SET status = :status WHERE id = :id";
                $stmt = $db->prepare($query);
                $stmt->execute([':status' => $next_status, ':id' => $order_id]);
                
                // Log notification for advanced status
                $info_stmt = $db->prepare("SELECT user_id, user_email FROM orders WHERE id = :id LIMIT 1");
                $info_stmt->execute([':id' => $order_id]);
                $order_info = $info_stmt->fetch();
                if ($order_info) {
                    createNotification($db, $order_info['user_id'], $order_info['user_email'], "Order $order_id status has progressed to: $next_status.");
                }
                
                sendResponse(true, ["nextStatus" => $next_status], "Order advanced to $next_status.");
            } else {
                sendResponse(false, null, "Order is already completed.", 400);
            }
        }
        
    } catch (PDOException $e) {
        error_log("Order update failure: " . $e->getMessage());
        sendResponse(false, null, "Failed to update order.", 500);
    }
}

// -------------------------------------------------------------
// DELETE FUNCTION
// -------------------------------------------------------------
function handleDelete($db) {
    $input = getJsonInput();
    $order_id = isset($input['orderId']) ? trim($input['orderId']) : (isset($_POST['orderId']) ? trim($_POST['orderId']) : '');
    
    if (empty($order_id)) {
         sendResponse(false, null, "Order ID is required for deleting.", 400);
    }
    
    try {
        // Fetch order to get user info and image to clean up
        $get_query = "SELECT user_id, user_email, image_path FROM orders WHERE id = :id LIMIT 1";
        $get_stmt = $db->prepare($get_query);
        $get_stmt->execute([':id' => $order_id]);
        $order_info = $get_stmt->fetch();
        
        $image_path = $order_info ? $order_info['image_path'] : null;
        
        // Log notification for deletion/cancellation
        if ($order_info) {
            createNotification($db, $order_info['user_id'], $order_info['user_email'], "Order $order_id has been cancelled.");
        }
        
        // Delete from database
        $query = "DELETE FROM orders WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->execute([':id' => $order_id]);
        
        if ($stmt->rowCount() > 0) {
            // Delete actual image file if exists
            if (!empty($image_path)) {
                $full_file_path = __DIR__ . '/../' . $image_path;
                if (file_exists($full_file_path)) {
                    unlink($full_file_path);
                }
            }
            sendResponse(true, null, "Order deleted successfully.");
        } else {
            sendResponse(false, null, "Order not found or already deleted.", 404);
        }
        
    } catch (PDOException $e) {
        error_log("Order deletion failure: " . $e->getMessage());
        sendResponse(false, null, "Failed to delete order.", 500);
    }
}
?>
