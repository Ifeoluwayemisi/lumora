# ⚡ Quick Reference - Developer Cheat Sheet

## 🚀 Running the Application

### Backend

```bash
cd backend
npm install          # First time only
npm run dev          # Start development server
npm run migrate      # Run database migrations
```

### Frontend

```bash
cd frontend
npm install          # First time only
npm run dev          # Start development server
```

### Access Points

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

---

## 📚 Key Files Reference

### Frontend User Pages

| Page          | Path                            | Purpose                                       |
| ------------- | ------------------------------- | --------------------------------------------- |
| Dashboard     | `/dashboard/user`               | User home page                                |
| Profile       | `/dashboard/user/profile`       | Edit profile, change password, delete account |
| Settings      | `/dashboard/user/settings`      | Notification preferences, data export         |
| History       | `/dashboard/user/history`       | View verification history                     |
| Favorites     | `/dashboard/user/favorites`     | Saved favorite codes                          |
| Notifications | `/dashboard/user/notifications` | Notification list                             |

### Backend Controllers

```
/backend/src/controllers/
├── userController.js         # Profile, password, settings, history
├── authController.js         # Login, register, password reset
├── verificationController.js # Verify codes
└── ...other controllers
```

### Backend Routes

```
/backend/src/routes/
├── userRoutes.js        # Profile, settings, history (8 endpoints)
├── authRoutes.js        # Login, register, reset
├── verificationRoutes.js # Code verification
└── ...other routes
```

---

## 🔗 API Quick Reference

### Profile (Requires Auth)

```javascript
// Update profile
PATCH /api/user/profile
{ name, email }

// Change password
PATCH /api/user/password
{ currentPassword, newPassword, confirmPassword }

// Delete account
DELETE /api/user/account
{ password, confirmation: "DELETE MY ACCOUNT" }
```

### Settings (Requires Auth)

```javascript
// Get settings
GET / api / user / settings;

// Update settings
PATCH / api / user / settings;
{
  emailNotifications, pushNotifications, weeklyDigest, suspiciousActivityAlerts;
}
```

### History (Requires Auth)

```javascript
// Get history
GET /api/user/history?page=1&limit=20&state=GENUINE&from=2025-01-01

// Export data
GET /api/user/history/export?format=csv|json|pdf

// Clear history
DELETE /api/user/history
{ confirmation: true }
```

### Dashboard (Requires Auth)

```javascript
// Get summary
GET / api / user / dashboard - summary;
```

---

## 🧪 Testing Endpoints

### Using Postman/Insomnia

1. **Get JWT Token**

```
POST http://localhost:5000/api/auth/login
{
  "email": "test@example.com",
  "password": "password123"
}
```

2. **Set Authorization Header**

```
Authorization: Bearer <token_from_above>
```

3. **Test Any Endpoint**

```
PATCH http://localhost:5000/api/user/profile
Headers: Authorization: Bearer <token>
Body: { "name": "New Name", "email": "new@example.com" }
```

---

## 🛠️ Common Tasks

### Add New API Endpoint

1. Create function in `/backend/src/controllers/userController.js`
2. Add route in `/backend/src/routes/userRoutes.js`
3. Test with Postman
4. Update frontend to call endpoint

### Fix Database Issue

```bash
# Reset database
npx prisma db push --skip-generate

# Create new migration
npx prisma migrate dev --name migration_name

# Generate Prisma client
npx prisma generate
```

### Test Frontend Form

1. Navigate to page in browser
2. Open browser DevTools (F12)
3. Check Network tab for API calls
4. Look for request/response details

### Debug Backend Issue

```bash
# Check logs
npm run dev    # Logs print to console

# Add debug logs
console.log('Debug info:', variable)

# Check database directly
npx prisma studio  # Opens GUI database viewer
```

---

## 📋 Status Check

### Frontend Pages (17 Total)

- [x] Home page
- [x] Verify page
- [x] Verify QR page
- [x] Verify result page
- [x] Login page
- [x] Register page
- [x] Password reset pages
- [x] Dashboard
- [x] History
- [x] Favorites
- [x] Notifications
- [x] **Profile (NEW)**
- [x] **Settings (NEW)**
- [x] Unauthorized page
- [x] Error page
- [x] 404 page

### Backend Endpoints (15 Total)

- [x] GET /api/user/history
- [x] POST /api/user/favorites
- [x] GET /api/user/favorites
- [x] DELETE /api/user/favorite/:id
- [x] GET /api/user/notifications
- [x] PATCH /api/user/notifications/:id
- [x] GET /api/user/dashboard
- [x] GET /api/user/history/export
- [x] **PATCH /api/user/profile (NEW)**
- [x] **PATCH /api/user/password (NEW)**
- [x] **DELETE /api/user/account (NEW)**
- [x] **GET /api/user/settings (NEW)**
- [x] **PATCH /api/user/settings (NEW)**
- [x] **DELETE /api/user/history (NEW)**
- [x] **GET /api/user/dashboard-summary (NEW)**

---

## 🔐 Security Reminders

- Always verify JWT token on protected endpoints
- Hash passwords with bcrypt
- Validate all user input
- Check user ID matches authenticated user
- Use HTTPS in production
- Don't log sensitive data

---

## 📊 Database Schema

### User

```sql
id, name, email, password, role, verified, createdAt, updatedAt
```

### VerificationLog

```sql
id, codeId, codeValue, userId, timestamp, verificationState, riskScore, createdAt
```

### UserFavorites (NEW)

```sql
id, userId, codeValue, productId, createdAt
```

### UserNotifications (NEW)

```sql
id, userId, type, message, read, createdAt
```

---

## 🐛 Common Errors & Fixes

| Error            | Cause                     | Fix                                                |
| ---------------- | ------------------------- | -------------------------------------------------- |
| 401 Unauthorized | Missing/invalid token     | Add valid JWT token to Authorization header        |
| 400 Bad Request  | Invalid data              | Check request body, validate email/password format |
| 404 Not Found    | Endpoint doesn't exist    | Check route path and HTTP method                   |
| 500 Server Error | Database/server issue     | Check server logs, check database connection       |
| CORS Error       | Frontend/backend mismatch | Check backend CORS config                          |

---

## 📖 Documentation Files

| File                      | Purpose                        |
| ------------------------- | ------------------------------ |
| API_ENDPOINTS.md          | Complete endpoint reference    |
| BACKEND_IMPLEMENTATION.md | Backend implementation details |
| E2E_TESTING_GUIDE.md      | Manual testing guide           |
| FRONTEND_AUDIT.md         | Frontend pages inventory       |
| IMPLEMENTATION_SUMMARY.md | What was built                 |
| VISUAL_USER_JOURNEY.md    | User flow diagrams             |
| COMPLETE_CHECKLIST.md     | Testing checklist              |

---

## 🎯 Today's Goals

- [ ] Start backend server (`npm run dev`)
- [ ] Start frontend server (`npm run dev`)
- [ ] Login to application
- [ ] Test profile page endpoints
- [ ] Test settings page endpoints
- [ ] Test history export
- [ ] Verify forms submit
- [ ] Check error handling

---

## 💡 Pro Tips

1. Use Postman collection for API testing
2. Use browser DevTools for frontend debugging
3. Use `npx prisma studio` to view database
4. Check console logs for error messages
5. Always include Authorization header
6. Test with different user accounts
7. Try error cases (invalid data, missing fields)
8. Check response status codes

---

## 📞 When Stuck

1. **Check logs** - Backend: `npm run dev` output. Frontend: DevTools console (F12)
2. **Read error message** - Usually tells you exactly what's wrong
3. **Check status code** - 4xx = client error, 5xx = server error
4. **Verify request format** - Correct URL, method, headers, body
5. **Check database** - Use `npx prisma studio` to verify data
6. **Review documentation** - API_ENDPOINTS.md has all details

---

**Last Updated**: January 12, 2026  
**Status**: ✅ Ready for Testing
