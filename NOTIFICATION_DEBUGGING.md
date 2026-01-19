# 📬 Notification System Debugging Guide

## Why You're Not Receiving Notifications

If you're not seeing notifications in the app or receiving emails, follow this debugging guide:

---

## 1️⃣ **Database Connection Check**

### Verify the database is running:

```bash
# Check if database is accessible
psql -U postgres -h db.prisma.io -d lumora -c "SELECT COUNT(*) FROM \"UserNotifications\";"
```

### Expected output:

```
 count
-------
   X
```

If you get a connection error, **database is not running**.

---

## 2️⃣ **Test Notification Creation (In-App)**

### Using the test endpoint:

1. **Start backend server:**

   ```bash
   cd backend
   npm run dev
   ```

2. **Call the test notification endpoint:**

   ```bash
   # Replace TOKEN with your actual JWT token
   curl -H "Authorization: Bearer TOKEN" \
   http://localhost:3001/api/user/notifications/test
   ```

3. **Expected response:**

   ```json
   {
     "success": true,
     "message": "Test notification created successfully",
     "notification": {
       "id": "abc123...",
       "userId": "user123...",
       "type": "VERIFICATION",
       "message": "✓ Test Notification - This is a test alert from Lumora system",
       "read": false,
       "createdAt": "2026-01-19T10:00:00.000Z"
     }
   }
   ```

4. **Check notifications page:**
   - Go to Dashboard → Notifications
   - You should see the test notification there
   - If you see it: ✅ In-app notifications are working
   - If you don't see it: ❌ Issue with database or frontend fetch

---

## 3️⃣ **Verify Notification is in Database**

Run this in your database client:

```sql
SELECT
  id,
  "userId",
  type,
  message,
  read,
  "createdAt"
FROM "UserNotifications"
ORDER BY "createdAt" DESC
LIMIT 10;
```

**What to look for:**

- Do you see recent notifications?
- Is the `userId` correct?
- Is the `type` correct? (Should be VERIFICATION, PAYMENT, ACCOUNT, or ALERT)

---

## 4️⃣ **Check Backend Logs for Errors**

When you verify a code or perform an action, check the backend console:

```
[NOTIFICATION_DEBUG] Starting verification notification for: {
  manufacturerId: "mfg123",
  codeValue: "ABC12345",
  verificationState: "GENUINE"
}

[NOTIFICATION_DEBUG] Found manufacturer: { id: "mfg123", userId: "user123" }
[NOTIFICATION_DEBUG] Found user: { id: "user123", email: "user@example.com" }
[NOTIFICATION_DEBUG] Notification created in DB: { id: "notif123", userId: "user123" }
```

### What each line means:

- **"Starting verification notification"** - Notification process started ✅
- **"Found manufacturer"** - Manufacturer lookup successful ✅
- **"Found user"** - User lookup successful ✅
- **"Notification created in DB"** - Saved to database ✅

### If you see warnings instead:

```
[NOTIFICATION_DEBUG] Manufacturer not found: mfg123
[NOTIFICATION_DEBUG] User not found for userId: user123
```

This means the manufacturer/user lookup failed.

---

## 5️⃣ **Common Issues & Solutions**

### **Issue: No debug logs appear**

**Cause:** Verification isn't triggering the notification  
**Solution:**

- Verify that the code exists in your system
- Check that you're a manufacturer (not a consumer)
- Look for other errors in the logs

### **Issue: Manufacturer not found**

**Cause:** The manufacturer record doesn't exist or isn't linked to your user  
**Solution:**

```sql
-- Check if you have a manufacturer record
SELECT id, "userId", name FROM "Manufacturer"
WHERE "userId" = 'your-user-id';

-- If empty, you need to create a manufacturer account
```

### **Issue: User not found**

**Cause:** Your user ID isn't properly set  
**Solution:**

```sql
-- Verify your user exists
SELECT id, email, role FROM "User"
WHERE email = 'your-email@example.com';
```

### **Issue: Email not sending**

**Cause:** Email service not configured  
**Solution:**
Check backend console for:

```
⚠️  Email service not configured
```

If you see this, email credentials aren't set. The system will still create in-app notifications, but won't send emails.

---

## 6️⃣ **Step-by-Step Testing Process**

### **Test 1: In-App Notification**

1. Open browser DevTools → Network tab
2. Call test endpoint: `/api/user/notifications/test`
3. Response status should be 200
4. Go to Dashboard → Notifications
5. **Expected:** See the test notification

### **Test 2: Code Verification Notification**

1. Ensure you have generated codes for a product
2. Share the code with someone
3. Have them verify the code
4. **Expected:** You receive a notification immediately
5. **Check backend logs** for the debug messages

### **Test 3: Database Check**

1. Run SQL query from section 4
2. **Expected:** See the notification in the table
3. If not there, the notification isn't being created

---

## 7️⃣ **Reset & Clear**

### Clear all notifications:

```sql
DELETE FROM "UserNotifications" WHERE "userId" = 'your-user-id';
```

### Check notification count:

```sql
SELECT COUNT(*) FROM "UserNotifications"
WHERE "userId" = 'your-user-id';
```

---

## 📋 **Checklist for Debugging**

- [ ] Database is running and accessible
- [ ] Backend server is running (`npm run dev`)
- [ ] You're logged in as a manufacturer user
- [ ] Test endpoint returns 200 and creates notification
- [ ] Test notification appears on Dashboard → Notifications
- [ ] Backend logs show `[NOTIFICATION_DEBUG]` messages
- [ ] Notification appears in database query
- [ ] Code verification triggers notification (check logs)

---

## 🆘 **Still Not Working?**

If you've gone through all steps and notifications still aren't appearing:

1. **Check your user role:**

   ```bash
   # Manufacturer users should have role: "MANUFACTURER"
   SELECT id, email, role FROM "User" WHERE email = 'your-email@example.com';
   ```

2. **Verify manufacturer exists:**

   ```bash
   SELECT * FROM "Manufacturer" WHERE "userId" = 'your-user-id';
   ```

3. **Check for database errors:**
   - Check if there are any database migration issues
   - Run: `npx prisma migrate deploy`
   - Then restart the backend

4. **Share these logs:**
   - Backend console output when you verify a code
   - Database query results from sections 4 and 6
   - Browser Network tab response from test endpoint
