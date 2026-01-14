# 🔗 User API Endpoints Documentation

**Status**: ✅ All endpoints implemented and ready for testing  
**Last Updated**: January 12, 2026

---

## 📋 Profile Management Endpoints

### 1. Update User Profile

**Endpoint**: `PATCH /api/user/profile`  
**Auth Required**: Yes (JWT)  
**Content-Type**: `application/json`

**Request Body**:

```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Response** (200 OK):

```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CONSUMER"
  }
}
```

**Error Cases**:

- 400: Missing name or email
- 400: Invalid email format
- 400: Email already in use
- 500: Server error

---

### 2. Change User Password

**Endpoint**: `PATCH /api/user/password`  
**Auth Required**: Yes (JWT)  
**Content-Type**: `application/json`

**Request Body**:

```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456",
  "confirmPassword": "newPassword456"
}
```

**Response** (200 OK):

```json
{
  "message": "Password changed successfully"
}
```

**Error Cases**:

- 400: Missing password fields
- 400: New passwords don't match
- 400: Password less than 8 characters
- 401: Current password incorrect
- 500: Server error

---

### 3. Delete User Account

**Endpoint**: `DELETE /api/user/account`  
**Auth Required**: Yes (JWT)  
**Content-Type**: `application/json`

**Request Body**:

```json
{
  "password": "currentPassword123",
  "confirmation": "DELETE MY ACCOUNT"
}
```

**Response** (200 OK):

```json
{
  "message": "Account deleted successfully"
}
```

**Error Cases**:

- 400: Invalid confirmation text
- 401: Password incorrect
- 404: User not found
- 500: Server error

---

## ⚙️ Settings Management Endpoints

### 4. Get User Settings

**Endpoint**: `GET /api/user/settings`  
**Auth Required**: Yes (JWT)

**Response** (200 OK):

```json
{
  "emailNotifications": true,
  "pushNotifications": false,
  "weeklyDigest": true,
  "suspiciousActivityAlerts": true
}
```

**Error Cases**:

- 500: Server error

---

### 5. Update User Settings

**Endpoint**: `PATCH /api/user/settings`  
**Auth Required**: Yes (JWT)  
**Content-Type**: `application/json`

**Request Body**:

```json
{
  "emailNotifications": true,
  "pushNotifications": false,
  "weeklyDigest": true,
  "suspiciousActivityAlerts": true
}
```

**Response** (200 OK):

```json
{
  "message": "Settings updated successfully",
  "settings": {
    "emailNotifications": true,
    "pushNotifications": false,
    "weeklyDigest": true,
    "suspiciousActivityAlerts": true
  }
}
```

**Error Cases**:

- 500: Server error

---

## 📊 History Management Endpoints

### 6. Get User History (Paginated)

**Endpoint**: `GET /api/user/history`  
**Auth Required**: Yes (JWT)  
**Query Parameters**:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `state` (optional): Filter by state (GENUINE, CODE_ALREADY_USED, INVALID, etc.)
- `from` (optional): Start date (ISO format: 2025-01-12)
- `to` (optional): End date (ISO format: 2025-01-12)

**Example**:

```
GET /api/user/history?page=1&limit=20&state=GENUINE
```

**Response** (200 OK):

```json
{
  "total": 150,
  "page": 1,
  "limit": 20,
  "pages": 8,
  "history": [
    {
      "id": "uuid",
      "codeValue": "ABC123XYZ",
      "verificationState": "GENUINE",
      "createdAt": "2025-01-12T10:30:00Z",
      "location": "Lagos, Nigeria"
    }
  ]
}
```

**Error Cases**:

- 500: Server error

---

### 7. Export User History

**Endpoint**: `GET /api/user/history/export`  
**Auth Required**: Yes (JWT)  
**Query Parameters**:

- `format` (required): `csv`, `json`, or `pdf` (default: csv)
- `state` (optional): Filter by state
- `from` (optional): Start date
- `to` (optional): End date

**Examples**:

```
GET /api/user/history/export?format=csv
GET /api/user/history/export?format=json&state=GENUINE
GET /api/user/history/export?format=pdf&from=2025-01-01&to=2025-01-31
```

**Response**:

- CSV: File download (text/csv)
- JSON: File download (application/json)
- PDF: File download (application/pdf)

**File Names**:

- `user_history.csv`
- `user_history.json`
- `user_history.pdf`

**Error Cases**:

- 400: Invalid format
- 500: Server error

---

### 8. Clear User History

**Endpoint**: `DELETE /api/user/history`  
**Auth Required**: Yes (JWT)  
**Content-Type**: `application/json`

**Request Body**:

```json
{
  "confirmation": true
}
```

**Response** (200 OK):

```json
{
  "message": "History cleared successfully",
  "deletedCount": 150
}
```

**Error Cases**:

- 400: Confirmation not provided
- 500: Server error

---

## 📈 Dashboard Endpoints

### 9. Get Dashboard Summary

**Endpoint**: `GET /api/user/dashboard-summary`  
**Auth Required**: Yes (JWT)

**Response** (200 OK):

```json
{
  "stats": {
    "total": 150,
    "genuine": 120,
    "suspicious": 25,
    "used": 10,
    "favorites": 8
  },
  "recent": [
    {
      "id": "uuid",
      "codeValue": "ABC123XYZ",
      "verificationState": "GENUINE",
      "createdAt": "2025-01-12T10:30:00Z"
    }
  ]
}
```

**Error Cases**:

- 500: Server error

---

### 10. Get Full Dashboard

**Endpoint**: `GET /api/user/dashboard`  
**Auth Required**: Yes (JWT)

**Response** (200 OK):

```json
{
  "total": 150,
  "genuine": 120,
  "highRisk": 25,
  "unregistered": 5
}
```

**Error Cases**:

- 500: Server error

---

## ❤️ Favorites Management

### 11. Add to Favorites

**Endpoint**: `POST /api/user/favorites`  
**Auth Required**: Yes (JWT)  
**Content-Type**: `application/json`

**Request Body**:

```json
{
  "codeValue": "ABC123XYZ",
  "productId": "uuid"
}
```

**Response** (201 Created):

```json
{
  "id": "uuid",
  "userId": "uuid",
  "codeValue": "ABC123XYZ",
  "productId": "uuid",
  "createdAt": "2025-01-12T10:30:00Z"
}
```

---

### 12. Get Favorites

**Endpoint**: `GET /api/user/favorites`  
**Auth Required**: Yes (JWT)

**Response** (200 OK):

```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "codeValue": "ABC123XYZ",
    "productId": "uuid",
    "createdAt": "2025-01-12T10:30:00Z"
  }
]
```

---

### 13. Remove from Favorites

**Endpoint**: `DELETE /api/user/favorite/:id`  
**Auth Required**: Yes (JWT)

**Response** (200 OK):

```json
{
  "success": true
}
```

---

## 🔔 Notifications Management

### 14. Get Notifications

**Endpoint**: `GET /api/user/notifications`  
**Auth Required**: Yes (JWT)

**Response** (200 OK):

```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "type": "VERIFICATION",
    "message": "Your verification was successful",
    "read": false,
    "createdAt": "2025-01-12T10:30:00Z"
  }
]
```

---

### 15. Mark Notification as Read

**Endpoint**: `PATCH /api/user/notifications/:id`  
**Auth Required**: Yes (JWT)

**Response** (200 OK):

```json
{
  "success": true
}
```

---

## 🔐 Authentication & Error Handling

### Standard Error Response

```json
{
  "message": "Error description"
}
```

### Status Codes

| Code | Meaning                              |
| ---- | ------------------------------------ |
| 200  | Success                              |
| 201  | Created                              |
| 400  | Bad Request (validation error)       |
| 401  | Unauthorized (invalid/missing token) |
| 404  | Not Found                            |
| 500  | Server Error                         |

### JWT Token

All protected endpoints require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

---

## 🧪 Testing Checklist

- [ ] Test profile update with valid data
- [ ] Test profile update with invalid email
- [ ] Test profile update with duplicate email
- [ ] Test password change with correct current password
- [ ] Test password change with incorrect current password
- [ ] Test password change with mismatched passwords
- [ ] Test account deletion with correct password
- [ ] Test account deletion with incorrect password
- [ ] Test get/update settings
- [ ] Test history export in all formats (CSV, JSON, PDF)
- [ ] Test clear history
- [ ] Test dashboard summary
- [ ] Test add/remove/get favorites
- [ ] Test get/mark notifications
- [ ] Test all endpoints with expired token
- [ ] Test all endpoints without token

---

## 📱 Frontend Integration

All frontend endpoints are implemented and ready to connect:

- `PATCH /api/user/profile` ← Profile page
- `PATCH /api/user/password` ← Profile page
- `DELETE /api/user/account` ← Profile page
- `GET /api/user/settings` ← Settings page
- `PATCH /api/user/settings` ← Settings page
- `GET /api/user/history/export` ← Settings page
- `DELETE /api/user/history` ← Settings page
- `GET /api/user/dashboard-summary` ← Dashboard page

**Next Step**: Test all endpoints and validate frontend/backend connection.
