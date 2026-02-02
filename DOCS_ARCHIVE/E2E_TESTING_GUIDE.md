# 🧪 End-to-End Testing Guide

**Purpose**: Manual testing of all implemented endpoints  
**Status**: Ready for QA  
**Date**: January 12, 2026

---

## 🛠️ Test Environment Setup

### Prerequisites

1. Backend running (`npm run dev`)
2. Frontend running (`npm run dev`)
3. Database populated with test user
4. Postman or Insomnia for API testing

### Test User Credentials

```
Email: test@example.com
Password: TestPassword123
```

---

## 📋 Test Cases

### 1️⃣ Authentication & Token Retrieval

#### Test: Login & Get JWT Token

**Steps**:

1. POST to `/api/auth/login` with test credentials
2. Copy JWT token from response
3. Use in Authorization header for all subsequent requests

**Expected Result**:

- Status 200
- Token in response
- Token valid for 24 hours

---

### 2️⃣ Profile Management

#### Test 2.1: Update Profile

**Endpoint**: `PATCH /api/user/profile`
**Headers**: `Authorization: Bearer <token>`

**Request**:

```json
{
  "name": "John Smith",
  "email": "john.smith@example.com"
}
```

**Expected Result**:

- Status 200
- Message: "Profile updated successfully"
- Updated name and email in response

**Test Cases**:

- [ ] Valid name and email → Success
- [ ] Missing name → 400 error
- [ ] Missing email → 400 error
- [ ] Invalid email format → 400 error
- [ ] Duplicate email → 400 error
- [ ] Email with spaces → Trimmed correctly

---

#### Test 2.2: Change Password

**Endpoint**: `PATCH /api/user/password`

**Request**:

```json
{
  "currentPassword": "TestPassword123",
  "newPassword": "NewPassword456",
  "confirmPassword": "NewPassword456"
}
```

**Expected Result**:

- Status 200
- Message: "Password changed successfully"

**Test Cases**:

- [ ] Correct current password → Success
- [ ] Incorrect current password → 401 error
- [ ] Password < 8 chars → 400 error
- [ ] Passwords don't match → 400 error
- [ ] Missing fields → 400 error
- [ ] Login with new password → Works

---

#### Test 2.3: Delete Account

**Endpoint**: `DELETE /api/user/account`

**Request**:

```json
{
  "password": "NewPassword456",
  "confirmation": "DELETE MY ACCOUNT"
}
```

**Expected Result**:

- Status 200
- Message: "Account deleted successfully"
- User can no longer login
- All user data deleted

**Test Cases**:

- [ ] Correct password + correct confirmation → Success
- [ ] Correct password + wrong confirmation → 400 error
- [ ] Wrong password + correct confirmation → 401 error
- [ ] Account no longer accessible → Verified
- [ ] History deleted → Verified
- [ ] Favorites deleted → Verified

---

### 3️⃣ Settings Management

#### Test 3.1: Get Settings

**Endpoint**: `GET /api/user/settings`

**Expected Result**:

- Status 200
- Returns notification preference object

```json
{
  "emailNotifications": true,
  "pushNotifications": false,
  "weeklyDigest": true,
  "suspiciousActivityAlerts": true
}
```

---

#### Test 3.2: Update Settings

**Endpoint**: `PATCH /api/user/settings`

**Request**:

```json
{
  "emailNotifications": false,
  "pushNotifications": true,
  "weeklyDigest": false,
  "suspiciousActivityAlerts": true
}
```

**Expected Result**:

- Status 200
- Returns updated settings
- Settings persist on subsequent GET

**Test Cases**:

- [ ] Update all settings → Success
- [ ] Update partial settings → Success
- [ ] Toggle individual settings → Works
- [ ] Settings persist → Verified

---

### 4️⃣ History Management

#### Test 4.1: Get History (Paginated)

**Endpoint**: `GET /api/user/history`

**Variations**:

- `?page=1&limit=20` (default)
- `?state=GENUINE` (filter by state)
- `?from=2025-01-01&to=2025-01-31` (date range)

**Expected Result**:

- Status 200
- Returns paginated results

```json
{
  "total": 100,
  "page": 1,
  "limit": 20,
  "pages": 5,
  "history": [...]
}
```

**Test Cases**:

- [ ] Get first page → Correct pagination
- [ ] Page beyond total → Empty array
- [ ] Filter by state → Only matching items
- [ ] Date range filter → Correct date range
- [ ] Combined filters → All work together

---

#### Test 4.2: Export History (CSV)

**Endpoint**: `GET /api/user/history/export?format=csv`

**Expected Result**:

- Status 200
- Content-Type: text/csv
- File: user_history.csv
- Contains all history in CSV format

**Verification**:

- [ ] File downloads successfully
- [ ] CSV format correct
- [ ] All columns present
- [ ] All rows included

---

#### Test 4.3: Export History (JSON)

**Endpoint**: `GET /api/user/history/export?format=json`

**Expected Result**:

- Status 200
- Content-Type: application/json
- File: user_history.json
- Valid JSON array

**Verification**:

- [ ] File downloads successfully
- [ ] Valid JSON format
- [ ] All fields present
- [ ] Correct structure

---

#### Test 4.4: Export History (PDF)

**Endpoint**: `GET /api/user/history/export?format=pdf`

**Expected Result**:

- Status 200
- Content-Type: application/pdf
- File: user_history.pdf
- Readable PDF document

**Verification**:

- [ ] File downloads successfully
- [ ] PDF opens in reader
- [ ] Contains verification history
- [ ] Includes title and export date

---

#### Test 4.5: Clear History

**Endpoint**: `DELETE /api/user/history`

**Request**:

```json
{
  "confirmation": true
}
```

**Expected Result**:

- Status 200
- Returns count of deleted records

```json
{
  "message": "History cleared successfully",
  "deletedCount": 100
}
```

**Verification**:

- [ ] Confirmation required → 400 without it
- [ ] History deleted → GET /history returns empty
- [ ] Count accurate → Matches deleted records

---

### 5️⃣ Dashboard

#### Test 5.1: Get Dashboard Summary

**Endpoint**: `GET /api/user/dashboard-summary`

**Expected Result**:

- Status 200
- Returns comprehensive stats

```json
{
  "stats": {
    "total": 100,
    "genuine": 80,
    "suspicious": 15,
    "used": 5,
    "favorites": 3
  },
  "recent": [...]
}
```

**Test Cases**:

- [ ] Stats calculate correctly
- [ ] Recent items list present
- [ ] Recent items in descending order
- [ ] Stats sum equals total

---

### 6️⃣ Favorites Management

#### Test 6.1: Add Favorite

**Endpoint**: `POST /api/user/favorites`

**Request**:

```json
{
  "codeValue": "ABC123XYZ",
  "productId": "product-uuid"
}
```

**Expected Result**:

- Status 201
- Returns created favorite object

---

#### Test 6.2: Get Favorites

**Endpoint**: `GET /api/user/favorites`

**Expected Result**:

- Status 200
- Returns array of favorites

---

#### Test 6.3: Remove Favorite

**Endpoint**: `DELETE /api/user/favorite/:id`

**Expected Result**:

- Status 200
- Returns success: true
- Removed from GET /favorites

---

### 7️⃣ Notifications Management

#### Test 7.1: Get Notifications

**Endpoint**: `GET /api/user/notifications`

**Expected Result**:

- Status 200
- Returns array of notifications (ordered by date)

---

#### Test 7.2: Mark as Read

**Endpoint**: `PATCH /api/user/notifications/:id`

**Expected Result**:

- Status 200
- Returns success: true
- Notification marked as read

---

## 🔐 Security Tests

### Test 8.1: Missing Token

**Request**: Any endpoint without Authorization header

**Expected Result**:

- Status 401
- Message: "Unauthorized"

---

### Test 8.2: Expired Token

**Request**: Endpoint with expired token

**Expected Result**:

- Status 401
- Message: "Token expired"

---

### Test 8.3: Invalid Token

**Request**: Endpoint with malformed token

**Expected Result**:

- Status 401
- Message: "Invalid token"

---

### Test 8.4: User Isolation

**Steps**:

1. Login as user1
2. Get user2's ID
3. Try to access user2's data with user1's token

**Expected Result**:

- Status 403 or 404
- Cannot access other user's data

---

## 🐛 Error Handling Tests

### Test 9.1: Invalid Request Body

**Request**: POST with malformed JSON

**Expected Result**:

- Status 400
- Descriptive error message

---

### Test 9.2: Missing Required Fields

**Request**: POST without required fields

**Expected Result**:

- Status 400
- Message lists missing fields

---

### Test 9.3: Invalid Data Types

**Request**: String where number expected

**Expected Result**:

- Status 400
- Type validation error

---

### Test 9.4: Database Error Recovery

**Steps**:

1. Disconnect database
2. Make API request
3. Reconnect database

**Expected Result**:

- Status 500
- Descriptive error message
- No data corruption
- Service recovers

---

## 📱 Frontend Integration Tests

### Test 10.1: Profile Page

**Steps**:

1. Navigate to /dashboard/user/profile
2. Edit name → PATCH /api/user/profile
3. Verify success toast
4. Edit email → Verify with API

**Expected Result**:

- Profile updates successfully
- UI reflects changes
- Validation works
- Error messages display

---

### Test 10.2: Settings Page

**Steps**:

1. Navigate to /dashboard/user/settings
2. Toggle notification switches
3. Export data in all formats
4. Clear history

**Expected Result**:

- Settings persist
- Exports download correctly
- History clears with confirmation
- UI updates reflect changes

---

### Test 10.3: Dashboard

**Steps**:

1. Navigate to /dashboard/user
2. Verify stats load
3. Verify recent items display
4. Check charts render

**Expected Result**:

- Dashboard loads in <1 second
- Stats display correctly
- Charts are accurate
- No loading errors

---

## ✅ Final Verification Checklist

### Backend

- [ ] All 8 new endpoints working
- [ ] All error cases handled
- [ ] Security checks in place
- [ ] Data validation working
- [ ] Database operations correct
- [ ] Error messages descriptive

### Frontend

- [ ] Profile page connects
- [ ] Settings page connects
- [ ] Dashboard page connects
- [ ] Form validation works
- [ ] Error messages display
- [ ] Success notifications show

### Integration

- [ ] Full flow: Login → Update → Verify
- [ ] Full flow: Login → Export → Download
- [ ] Full flow: Login → Delete → Logout
- [ ] Mobile responsive works
- [ ] Dark mode works
- [ ] Performance acceptable

### Security

- [ ] Auth required on all endpoints
- [ ] User isolation enforced
- [ ] Password hashed and verified
- [ ] Passwords validated
- [ ] Data encrypted in transit (HTTPS)
- [ ] No sensitive data in logs

---

## 📊 Performance Baselines

### Response Times (Target)

- GET requests: < 100ms
- POST requests: < 200ms
- DELETE requests: < 100ms
- Export requests: < 500ms

### Load Testing (Optional)

- Concurrent users: 100
- Requests per second: 50
- Success rate: 99%+

---

## 🚀 Ready for Production?

**Prerequisites**:

- [ ] All tests passed
- [ ] Security audit completed
- [ ] Performance tested
- [ ] Error handling verified
- [ ] Documentation complete
- [ ] Backups configured
- [ ] Monitoring enabled

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue**: 401 Unauthorized

- Check token is valid
- Check Authorization header format
- Check token not expired

**Issue**: 400 Bad Request

- Check request body is valid JSON
- Check all required fields present
- Check field values match expected types

**Issue**: 500 Server Error

- Check database connection
- Check server logs
- Check request data doesn't exceed limits

---

## 📝 Test Report Template

```
TEST RUN: [Date]
TESTER: [Name]
ENVIRONMENT: [Dev/Staging/Prod]

RESULTS:
- Profile Management: [✅/❌]
- Settings Management: [✅/❌]
- History Management: [✅/❌]
- Dashboard: [✅/❌]
- Security: [✅/❌]
- Frontend Integration: [✅/❌]

ISSUES FOUND:
[List any bugs]

NOTES:
[Any observations]

SIGN-OFF: [Tester Name]
```

---

**Status**: Ready for testing. All endpoints implemented and documented.
