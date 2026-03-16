# Google OAuth Setup Guide

## 🎯 Current Status

- ✅ Google OAuth backend is fully implemented
- ✅ Google sign-in/sign-up buttons added to frontend (Login & Register pages)
- ❌ **MISSING**: Google Client ID and Client Secret in `.env`

## ❌ Why Google isn't working yet

The following error appears when clicking "Continue with Google" button:

```
Google OAuth not configured. Please contact admin...
```

This is because `.env` still has placeholder values:

```
GOOGLE_CLIENT_ID="your_google_client_id_here"
GOOGLE_CLIENT_SECRET="your_google_client_secret_here"
```

## 📋 Step-by-Step Guide to Get Credentials

### Step 1: Go to Google Cloud Console

1. Visit: **https://console.cloud.google.com/**
2. Sign in with your Google account (or create one)
3. Accept terms if prompted

### Step 2: Create a New Project (if needed)

1. Click the **Project Selector** (top left, next to "Google Cloud")
2. Click **"NEW PROJECT"**
3. Name it: `Lumora` (or any name)
4. Click **"CREATE"** and wait ~1-2 minutes

### Step 3: Enable Google+ API

1. Search for **"Google+ API"** in the search bar
2. Click on it from results
3. Click **"ENABLE"**
4. Wait for it to enable (~30 seconds)

### Step 4: Create OAuth 2.0 Credentials

1. Go to **Credentials** (left sidebar → APIs & Services → Credentials)
2. Click **"+ CREATE CREDENTIALS"** (top button)
3. Select **"OAuth client ID"**
   - If prompted, first configure OAuth consent screen:
     - Click "Configure Consent Screen"
     - Choose **"External"** user type
     - Click **"CREATE"**
     - Fill in:
       - **App name**: `Lumora`
       - **User support email**: Your email
       - Click **"SAVE AND CONTINUE"**
     - Skip scopes (click through)
     - Add test user if needed (add your email)
     - Click **"SAVE AND CONTINUE"**
     - Go back to Credentials

4. Now click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"** again
5. Select **"Web application"**
6. Add Authorized Redirect URIs:
   - **For Development**: `http://localhost:5000/api/auth/google/callback`
   - **For Production**: `https://your-backend-url.com/api/auth/google/callback` (replace with actual URL when deployed)
7. Click **"CREATE"**

### Step 5: Copy Your Credentials

A popup will show your credentials:

- **Client ID**: Copy this
- **Client Secret**: Copy this
- Click **"COPY"** button or download as JSON

### Step 6: Update Backend `.env`

1. Open: `backend/.env`
2. Find these lines:
   ```
   GOOGLE_CLIENT_ID="your_google_client_id_here"
   GOOGLE_CLIENT_SECRET="your_google_client_secret_here"
   ```
3. Replace with your actual credentials:
   ```
   GOOGLE_CLIENT_ID="YOUR_CLIENT_ID_PASTE_HERE"
   GOOGLE_CLIENT_SECRET="YOUR_CLIENT_SECRET_PASTE_HERE"
   ```
4. Save the file

### Step 7: Update Production Backend URL (when deployed)

When you deploy backend to production, update:

```
BACKEND_URL="https://your-actual-backend-url.com"
```

Example:

```
BACKEND_URL="https://lumora-backend.render.com"
```

**⚠️ Then go back to Google Cloud Console and update the Authorized Redirect URI to:**

```
https://your-actual-backend-url.com/api/auth/google/callback
```

## 🧪 Testing Google OAuth

### Step 1: Restart Backend

```bash
cd backend
npm start
```

### Step 2: Test Sign-In (existing user with email)

1. Go to **https://lumora-gold.vercel.app/auth/login**
2. Click **"Continue with Google"**
3. Sign in with any Google account
4. If account doesn't exist → Creates new user
5. If account exists → Shows error asking to sign in with email

### Step 3: Test Sign-Up (new user)

1. Go to **https://lumora-gold.vercel.app/auth/register**
2. Click **"Sign up with Google"**
3. Sign in with Google
4. If not registered → Creates account and logs in
5. If already registered → Shows error, redirects to login page

## 🔍 Troubleshooting

### Error: "Redirect URI mismatch"

**Solution**: Update Google Cloud Console with correct redirect URI (exactly as shown in error)

### Error: "Invalid client" or "Not found"

**Solution**: Check Client ID and Secret are correct (no extra spaces)

### Error: "User already exists"

**Solution**: This is expected! User needs to sign in with email instead, or link Google account after login

### Error: "Google OAuth not configured"

**Solution**: Make sure you've entered `Client ID` and `Client Secret` in `.env` (not still placeholder values)

## 📱 User Flow

### New User (First time)

```
1. Clicks "Sign up with Google" on register page
2. Google account verification
3. Account automatically created with Google info
4. Logged in and redirected to dashboard
```

### Existing Email User + Google

```
1. User has account created with email: user@example.com
2. Tries to "Sign up with Google" with same email
3. Gets error: "Account already exists"
4. Solution: Sign in with email first, then link Google later
```

### Existing User (Return visit)

```
1. Clicks "Continue with Google" on login page
2. Google account verification
3. Logged in immediately if account exists
4. Auto-created if new account
```

## 📚 API Endpoints

- `GET /api/auth/google/url?intent=signin` - Get Google OAuth URL for sign-in
- `GET /api/auth/google/url?intent=signup` - Get Google OAuth URL for sign-up
- `GET /api/auth/google/callback?code=...` - OAuth callback (Google redirects here)
- `POST /api/auth/google/verify` - Verify Google ID token (alternative method)

## 🔐 Security Notes

- Client Secret should NEVER be exposed in frontend code
- Always validate OAuth tokens on backend
- Use HTTPS in production
- Rotate credentials if compromised
- Store credentials in `.env` (never in git)

## 🚀 Next Steps After Setup

1. Test Google OAuth flow with both sign-in and sign-up
2. Verify user accounts are created correctly
3. Test error handling (existing user errors, network errors)
4. Deploy backend with credentials to production
5. Update `BACKEND_URL` in production `.env`
6. Test full production OAuth flow

---

**Need Help?**

- Google OAuth Docs: https://developers.google.com/identity/protocols/oauth2
- Console: https://console.cloud.google.com
- Errors with API: Check browser console and backend logs
