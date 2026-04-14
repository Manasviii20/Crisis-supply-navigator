# Crisis Supply Navigator - API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most write operations require authentication via JWT token.

**Header Format:**
```
Authorization: Bearer <token>
```

**Get Token:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@crisisnavigator.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@crisisnavigator.com",
      "role": "admin",
      "full_name": "System Administrator",
      "phone": "+91 9876543200"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

---

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "volunteer",
  "full_name": "New User",
  "phone": "+91 9876543299"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@crisisnavigator.com",
  "password": "admin123"
}
```

### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "Updated Name",
  "phone": "+91 9876543299"
}
```

### Change Password
```http
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "admin123",
  "newPassword": "newpassword456"
}
```

---

## Supplies Endpoints

### Get All Supplies
```http
GET /api/supplies
GET /api/supplies?category=Food
GET /api/supplies?status=Available
GET /api/supplies?search=rice
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Rice Bags",
      "category": "Food",
      "quantity": 500,
      "unit": "bags",
      "status": "Available",
      "location": "Warehouse A",
      "description": "50kg rice bags for distribution",
      "created_at": "2026-04-14T10:00:00.000Z",
      "updated_at": "2026-04-14T10:00:00.000Z"
    }
  ]
}
```

### Get Supply Statistics
```http
GET /api/supplies/statistics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_supplies": 10,
      "total_quantity": 3200,
      "available_count": 7,
      "low_stock_count": 2,
      "in_transit_count": 1
    },
    "categoryBreakdown": [
      {
        "category": "Food",
        "count": 3,
        "total_quantity": 880
      },
      {
        "category": "Water",
        "count": 2,
        "total_quantity": 1500
      }
    ]
  }
}
```

### Get Supply by ID
```http
GET /api/supplies/1
```

### Create Supply
```http
POST /api/supplies
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Tents",
  "category": "Shelter",
  "quantity": 50,
  "unit": "pieces",
  "status": "Available",
  "location": "Warehouse D",
  "description": "Emergency tents for 4 people"
}
```

### Update Supply
```http
PUT /api/supplies/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Rice Bags (Updated)",
  "quantity": 450,
  "status": "Low Stock"
}
```

### Delete Supply
```http
DELETE /api/supplies/1
Authorization: Bearer <token>
```

---

## Shelters Endpoints

### Get All Shelters
```http
GET /api/shelters
GET /api/shelters?status=Accepting
GET /api/shelters?search=Community
```

### Get Shelter Statistics
```http
GET /api/shelters/statistics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_shelters": 5,
    "total_capacity": 750,
    "total_occupancy": 620,
    "accepting_count": 2,
    "limited_space_count": 2,
    "full_count": 1
  }
}
```

### Get Shelter by ID
```http
GET /api/shelters/1
```

### Create Shelter
```http
POST /api/shelters
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Emergency Shelter X",
  "address": "123 Emergency St, Chennai",
  "capacity": 200,
  "current_occupancy": 0,
  "status": "Accepting",
  "contact_person": "John Doe",
  "contact_phone": "+91 9876543210",
  "contact_email": "john@example.com",
  "latitude": 12.82,
  "longitude": 80.04,
  "facilities": ["food", "medical", "sleeping"]
}
```

### Update Shelter
```http
PUT /api/shelters/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Shelter Name",
  "capacity": 250,
  "contact_phone": "+91 9876543299"
}
```

### Update Shelter Occupancy
```http
PATCH /api/shelters/1/occupancy
Authorization: Bearer <token>
Content-Type: application/json

{
  "occupancy": 150
}
```

### Delete Shelter
```http
DELETE /api/shelters/1
Authorization: Bearer <token>
```

---

## Deliveries Endpoints

### Get All Deliveries
```http
GET /api/deliveries
GET /api/deliveries?status=In Transit
GET /api/deliveries?supply_id=1
```

### Get Today's Deliveries
```http
GET /api/deliveries/today
```

### Get Delivery Statistics
```http
GET /api/deliveries/statistics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_deliveries": 5,
    "scheduled_count": 2,
    "in_transit_count": 2,
    "delivered_count": 1,
    "cancelled_count": 0
  }
}
```

### Get Delivery by ID
```http
GET /api/deliveries/1
```

### Create Delivery
```http
POST /api/deliveries
Authorization: Bearer <token>
Content-Type: application/json

{
  "supply_id": 1,
  "from_location": "Warehouse A",
  "to_location": "Community Center B",
  "quantity": 100,
  "status": "Scheduled",
  "driver_name": "Raj Kumar",
  "driver_phone": "+91 9876543220",
  "vehicle_number": "TN-01-AB-1234",
  "scheduled_date": "2026-04-15T10:00:00",
  "notes": "Urgent delivery"
}
```

### Update Delivery
```http
PUT /api/deliveries/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "In Transit",
  "driver_phone": "+91 9876543299"
}
```

### Update Delivery Status
```http
PATCH /api/deliveries/1/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Delivered"
}
```

Valid statuses: `Scheduled`, `In Transit`, `Delivered`, `Cancelled`

### Delete Delivery
```http
DELETE /api/deliveries/1
Authorization: Bearer <token>
```

---

## Admin Endpoints

### Get All Users
```http
GET /api/admin/users
Authorization: Bearer <admin_token>
```

### Update User
```http
PUT /api/admin/users/3
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "role": "coordinator",
  "is_active": true
}
```

### Delete User
```http
DELETE /api/admin/users/3
Authorization: Bearer <admin_token>
```

### Get Comprehensive Statistics
```http
GET /api/admin/statistics
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "supplies": {
      "total_supplies": 10,
      "total_quantity": 3200,
      "available_count": 7,
      "low_stock_count": 2,
      "in_transit_count": 1
    },
    "shelters": {
      "total_shelters": 5,
      "total_capacity": 750,
      "total_occupancy": 620,
      "accepting_count": 2,
      "limited_space_count": 2,
      "full_count": 1
    },
    "deliveries": {
      "total_deliveries": 5,
      "scheduled_count": 2,
      "in_transit_count": 2,
      "delivered_count": 1,
      "cancelled_count": 0
    },
    "users": {
      "total_users": 3,
      "admin_count": 1,
      "coordinator_count": 1,
      "volunteer_count": 1,
      "active_count": 3
    }
  }
}
```

### Get Dashboard Overview
```http
GET /api/admin/dashboard
Authorization: Bearer <token>
```

---

## Health Check

### API Status
```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "message": "Crisis Supply Navigator API is running",
  "timestamp": "2026-04-14T12:00:00.000Z"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Name, category, quantity, and unit are required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Supply not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Rate Limiting
Currently not implemented. Recommended for production use.

## CORS
CORS is enabled for all origins in development. Configure specific origins for production.

## Versioning
API version: v1 (implicit)

---

## Notes
- All timestamps are in ISO 8601 format
- IDs are auto-increment integers
- Pagination not yet implemented
- Search uses SQL LIKE for pattern matching
- All write operations require authentication
- Delete operations require admin role
