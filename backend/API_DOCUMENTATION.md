# 📚 API DOCUMENTATION

Complete documentation of all API endpoints for the Laundry Management System.

## Base URL

```
http://localhost/jenjen-po-main/backend
```

## Response Format

All responses are JSON with the following structure:

### Success Response (2xx)
```json
{
  "success": true,
  "message": "Success message",
  "data": {
    // Response data
  }
}
```

### Error Response (4xx, 5xx)
```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field_name": "Error description"
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "per_page": 10,
    "total_pages": 10,
    "has_next": true,
    "has_prev": false
  }
}
```

## Authentication

Most endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource not found |
| 405 | Method Not Allowed - Wrong HTTP method |
| 409 | Conflict - Duplicate resource |
| 422 | Unprocessable Entity - Validation failed |
| 500 | Internal Server Error |

---

## 🔐 AUTHENTICATION ENDPOINTS

### 1. User Registration

**Endpoint:** `POST /api/auth/signup`

**Description:** Create a new user account

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirm_password": "password123"
}
```

**Query Parameters:** None

**Headers:**
```
Content-Type: application/json
```

**Authorization:** Not required

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 3,
    "email": "john@example.com",
    "full_name": "John Doe",
    "role": "customer",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Validation Rules:**
- `full_name`: Required, minimum 1 character
- `email`: Required, valid email format, must be unique
- `password`: Required, minimum 6 characters
- `confirm_password`: Required, must match password

**Error Response (422):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Email already exists",
    "password": "Password must be at least 6 characters"
  }
}
```

---

### 2. User Login

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate user and receive JWT token

**Request Body:**
```json
{
  "email": "customer@demo.com",
  "password": "password123"
}
```

**Query Parameters:** None

**Headers:**
```
Content-Type: application/json
```

**Authorization:** Not required

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 1,
    "email": "customer@demo.com",
    "full_name": "Customer Demo",
    "role": "customer",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Validation Rules:**
- `email`: Required, valid email format
- `password`: Required

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### 3. Get Current User

**Endpoint:** `GET /api/auth/me`

**Description:** Get authenticated user's information

**Query Parameters:** None

**Headers:**
```
Authorization: Bearer {token}
```

**Authorization:** Required (JWT token)

**Response (200):**
```json
{
  "success": true,
  "message": "User data retrieved successfully",
  "data": {
    "id": 1,
    "email": "customer@demo.com",
    "full_name": "Customer Demo",
    "role": "customer",
    "phone_number": "09123456789",
    "address": "123 Main Street, City",
    "created_at": "2024-05-26 10:00:00"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Unauthorized: Invalid or missing token"
}
```

---

## 📦 ORDER ENDPOINTS

### 4. Create Order

**Endpoint:** `POST /api/orders`

**Description:** Create a new laundry order

**Request Body:**
```json
{
  "customer_name": "John Doe",
  "contact_number": "09123456789",
  "laundry_type": "wash-fold",
  "weight": 5.0,
  "special_instructions": "Gentle care only"
}
```

**Query Parameters:** None

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {token}
```

**Authorization:** Required (customer or admin)

**Response (201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": 4,
    "order_code": "LDY-0004",
    "user_id": 1,
    "customer_name": "John Doe",
    "contact_number": "09123456789",
    "laundry_type": "wash-fold",
    "weight": "5.00",
    "special_instructions": "Gentle care only",
    "status": "Received",
    "estimated_pickup": "2024-05-29",
    "notification_read": 0,
    "created_at": "2024-05-26 10:00:00",
    "updated_at": "2024-05-26 10:00:00"
  }
}
```

**Validation Rules:**
- `customer_name`: Required
- `contact_number`: Required, valid phone format
- `laundry_type`: Required, one of: wash-fold, dry-clean, express, delicate
- `weight`: Required, must be numeric and > 0
- `special_instructions`: Optional

**Laundry Types:**
- `wash-fold`: Wash & Fold
- `dry-clean`: Dry Clean
- `express`: Express (ready within 24 hours)
- `delicate`: Delicate Items

---

### 5. List Orders

**Endpoint:** `GET /api/orders`

**Description:** Retrieve list of orders with pagination

**Query Parameters:**
- `page` (optional): Page number, default: 1
- `per_page` (optional): Items per page, default: 10
- `status` (optional): Filter by status (Received, Washing, Drying, Folding, Ready for Pickup)
- `sort` (optional): Sort by field (created_at, status, customer_name, weight)

**Example:** `GET /api/orders?page=1&per_page=10&status=Received&sort=created_at`

**Headers:**
```
Authorization: Bearer {token}
```

**Authorization:** Required

**Access Control:**
- Customers see only their own orders
- Admins see all orders

**Response (200):**
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": [
    {
      "id": 1,
      "order_code": "LDY-0001",
      "user_id": 1,
      "customer_name": "Customer Demo",
      "contact_number": "09123456789",
      "laundry_type": "wash-fold",
      "weight": "5.00",
      "status": "Received",
      "estimated_pickup": "2024-05-28"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "per_page": 10,
    "total_pages": 5,
    "has_next": true,
    "has_prev": false
  }
}
```

---

### 6. Get Single Order

**Endpoint:** `GET /api/orders?id={id}`

**Description:** Retrieve a specific order

**Query Parameters:**
- `id` (required): Order ID

**Headers:**
```
Authorization: Bearer {token}
```

**Authorization:** Required

**Access Control:**
- Customers can only view their own orders
- Admins can view any order

**Response (200):**
```json
{
  "success": true,
  "message": "Order retrieved successfully",
  "data": {
    "id": 1,
    "order_code": "LDY-0001",
    "user_id": 1,
    "customer_name": "Customer Demo",
    "contact_number": "09123456789",
    "laundry_type": "wash-fold",
    "weight": "5.00",
    "special_instructions": "Normal wash",
    "status": "Received",
    "estimated_pickup": "2024-05-28",
    "notification_read": 0,
    "created_at": "2024-05-26 10:00:00"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Order not found"
}
```

---

### 7. Update Order

**Endpoint:** `PUT /api/orders?id={id}`

**Description:** Update an order (admin only)

**Query Parameters:**
- `id` (required): Order ID

**Request Body:**
```json
{
  "status": "Washing",
  "special_instructions": "Updated instructions"
}
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {token}
```

**Authorization:** Required (admin only)

**Response (200):**
```json
{
  "success": true,
  "message": "Order updated successfully",
  "data": {
    "id": 1,
    "order_code": "LDY-0001",
    "status": "Washing",
    "special_instructions": "Updated instructions",
    "updated_at": "2024-05-26 11:00:00"
  }
}
```

**Valid Statuses:**
- Received
- Washing
- Drying
- Folding
- Ready for Pickup

**Note:** When status changes to "Ready for Pickup", a notification is created for the customer.

---

### 8. Delete Order

**Endpoint:** `DELETE /api/orders?id={id}`

**Description:** Delete an order (admin only)

**Query Parameters:**
- `id` (required): Order ID

**Headers:**
```
Authorization: Bearer {token}
```

**Authorization:** Required (admin only)

**Response (200):**
```json
{
  "success": true,
  "message": "Order deleted successfully",
  "data": {
    "id": 1
  }
}
```

---

### 9. Search Orders

**Endpoint:** `GET /api/orders/search`

**Description:** Search orders by customer name or order code

**Query Parameters:**
- `q` (required): Search query
- `page` (optional): Page number, default: 1
- `per_page` (optional): Items per page, default: 10

**Example:** `GET /api/orders/search?q=John&page=1&per_page=10`

**Headers:**
```
Authorization: Bearer {token}
```

**Authorization:** Required

**Access Control:**
- Customers see only their own orders in search results
- Admins see all matching orders

**Response (200):**
```json
{
  "success": true,
  "message": "Search results retrieved successfully",
  "data": [
    {
      "id": 1,
      "order_code": "LDY-0001",
      "customer_name": "John Doe",
      "status": "Received"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "per_page": 10,
    "total_pages": 1,
    "has_next": false,
    "has_prev": false
  }
}
```

---

## 📅 BOOKING ENDPOINTS

### 10. Create Booking

**Endpoint:** `POST /api/bookings`

**Description:** Create a new appointment booking

**Request Body:**
```json
{
  "booking_date": "2024-05-27",
  "booking_time": "10:00 AM",
  "service_type": "dropoff"
}
```

**Query Parameters:** None

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {token}
```

**Authorization:** Required

**Response (201):**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": 5,
    "user_id": 1,
    "booking_date": "2024-05-27",
    "booking_time": "10:00 AM",
    "service_type": "dropoff",
    "user_name": "Customer Demo",
    "user_email": "customer@demo.com",
    "status": "pending",
    "created_at": "2024-05-26 10:00:00"
  }
}
```

**Validation Rules:**
- `booking_date`: Required, must be future date (YYYY-MM-DD format)
- `booking_date`: Must be within next 30 days
- `booking_time`: Required, must be one of available time slots
- `service_type`: Required, either "pickup" or "dropoff"
- Maximum 3 bookings per time slot

**Available Time Slots:**
- 08:00 AM, 09:00 AM, 10:00 AM, 11:00 AM, 12:00 PM
- 01:00 PM, 02:00 PM, 03:00 PM, 04:00 PM, 05:00 PM, 06:00 PM

**Error Response (409):**
```json
{
  "success": false,
  "message": "This time slot is fully booked. Please choose another time."
}
```

---

### 11. List Bookings

**Endpoint:** `GET /api/bookings`

**Description:** Retrieve list of bookings

**Query Parameters:**
- `page` (optional): Page number, default: 1
- `per_page` (optional): Items per page, default: 10
- `status` (optional): Filter by status (pending, accepted, rejected)
- `date` (optional): Filter by booking date (YYYY-MM-DD)
- `sort` (optional): Sort by field (booking_date, created_at)

**Example:** `GET /api/bookings?status=pending&page=1&per_page=10`

**Headers:**
```
Authorization: Bearer {token}
```

**Authorization:** Required

**Access Control:**
- Customers see only their own bookings
- Admins see all bookings

**Response (200):**
```json
{
  "success": true,
  "message": "Bookings retrieved successfully",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "booking_date": "2024-05-27",
      "booking_time": "10:00 AM",
      "service_type": "dropoff",
      "user_name": "Customer Demo",
      "user_email": "customer@demo.com",
      "status": "pending",
      "created_at": "2024-05-26 10:00:00"
    }
  ],
  "pagination": {
    "total": 20,
    "page": 1,
    "per_page": 10,
    "total_pages": 2,
    "has_next": true,
    "has_prev": false
  }
}
```

---

### 12. Get Single Booking

**Endpoint:** `GET /api/bookings?id={id}`

**Description:** Retrieve a specific booking

**Query Parameters:**
- `id` (required): Booking ID

**Headers:**
```
Authorization: Bearer {token}
```

**Authorization:** Required

**Access Control:**
- Customers can only view their own bookings
- Admins can view any booking

**Response (200):**
```json
{
  "success": true,
  "message": "Booking retrieved successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "booking_date": "2024-05-27",
    "booking_time": "10:00 AM",
    "service_type": "dropoff",
    "user_name": "Customer Demo",
    "user_email": "customer@demo.com",
    "status": "pending",
    "created_at": "2024-05-26 10:00:00"
  }
}
```

---

### 13. Update Booking

**Endpoint:** `PUT /api/bookings?id={id}`

**Description:** Update a booking

**Query Parameters:**
- `id` (required): Booking ID

**Request Body (Admin - Accept/Reject):**
```json
{
  "status": "accepted"
}
```

**Request Body (Customer - Reschedule):**
```json
{
  "booking_date": "2024-05-28",
  "booking_time": "02:00 PM"
}
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {token}
```

**Authorization:** Required

**Access Control:**
- Admins can only change status
- Customers can only reschedule their own pending bookings

**Response (200):**
```json
{
  "success": true,
  "message": "Booking updated successfully",
  "data": {
    "id": 1,
    "status": "accepted",
    "updated_at": "2024-05-26 11:00:00"
  }
}
```

---

### 14. Delete Booking

**Endpoint:** `DELETE /api/bookings?id={id}`

**Description:** Delete a booking

**Query Parameters:**
- `id` (required): Booking ID

**Headers:**
```
Authorization: Bearer {token}
```

**Authorization:** Required

**Access Control:**
- Customers can only delete their own pending bookings
- Admins can delete any booking

**Response (200):**
```json
{
  "success": true,
  "message": "Booking deleted successfully",
  "data": {
    "id": 1
  }
}
```

---

### 15. Check Slot Availability

**Endpoint:** `GET /api/bookings/availability`

**Description:** Check available time slots for a specific date

**Query Parameters:**
- `date` (required): Date to check (YYYY-MM-DD)

**Example:** `GET /api/bookings/availability?date=2024-05-27`

**Headers:** None required

**Authorization:** Not required

**Response (200):**
```json
{
  "success": true,
  "message": "Availability retrieved successfully",
  "data": {
    "date": "2024-05-27",
    "slots": [
      {
        "time": "08:00 AM",
        "available": true,
        "booked_count": 0,
        "max_slots": 3
      },
      {
        "time": "09:00 AM",
        "available": true,
        "booked_count": 2,
        "max_slots": 3
      },
      {
        "time": "10:00 AM",
        "available": false,
        "booked_count": 3,
        "max_slots": 3
      }
    ],
    "max_slots_per_time": 3
  }
}
```

---

## 🧪 Example cURL Commands

### Register
```bash
curl -X POST http://localhost/jenjen-po-main/backend/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "confirm_password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost/jenjen-po-main/backend/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@demo.com",
    "password": "password123"
  }'
```

### Get Current User
```bash
curl -X GET http://localhost/jenjen-po-main/backend/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Order
```bash
curl -X POST http://localhost/jenjen-po-main/backend/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "customer_name": "John Doe",
    "contact_number": "09123456789",
    "laundry_type": "wash-fold",
    "weight": 5.0,
    "special_instructions": "Gentle care only"
  }'
```

### Create Booking
```bash
curl -X POST http://localhost/jenjen-po-main/backend/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "booking_date": "2024-05-27",
    "booking_time": "10:00 AM",
    "service_type": "dropoff"
  }'
```

### Check Availability
```bash
curl -X GET "http://localhost/jenjen-po-main/backend/api/bookings/availability?date=2024-05-27"
```

---

## 📝 Rate Limiting

Currently no rate limiting is implemented. For production, consider adding:
- Requests per minute limits
- IP-based throttling
- User-based quotas

---

## 🔄 Pagination

Paginated endpoints return:
- `total`: Total number of items
- `page`: Current page number
- `per_page`: Items per page
- `total_pages`: Total number of pages
- `has_next`: Whether more pages exist
- `has_prev`: Whether previous pages exist

---

## 📚 Additional Notes

- All timestamps are in UTC format
- Dates use YYYY-MM-DD format
- Times use HH:MM AM/PM format
- Monetary values use 2 decimal places
- All responses include a timestamp
- Request ID not currently implemented

---

**Last Updated:** May 26, 2024
