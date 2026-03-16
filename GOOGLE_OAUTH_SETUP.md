# Landing Page & Google OAuth Setup Guide

## 🎨 Landing Page Improvements

### Issues Fixed:

1. ✅ **Hero text readability** - Changed overlay from light (translucent white) to dark (85% black opacity) for better contrast
2. ✅ **Button styling** - Made "Verify" button much more prominent with:
   - Larger size and padding
   - Hover scale effect (transforms to 1.05x on hover)
   - Better shadow effects
   - Changed label to "Verify Now" for clarity
   - Added loading animation with emoji
3. ✅ **Background image** - Changed from generic workplace photo to pharmaceutical/verification-related image from Unsplash
4. ✅ **Statistics cards** - Added glass-morphism effect with backdrop blur for modern look
5. ✅ **Google OAuth integration** - Added "Sign in with Google" button on landing page and login page

---

## 🔐 Google OAuth Setup Instructions

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a Project" → "New Project"
3. Name it "Lumora" and create

### Step 2: Enable Google+ API

1. In the console, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Choose "Web application"
4. Set the following:
   - **Name**: "Lumora Web App"
   - **Authorized JavaScript origins**: Add both:
     - `http://localhost:5000` (for backend)
     - `http://localhost:3000` (for frontend testing)
   - **Authorized redirect URIs**: Add:
     - `http://localhost:5000/api/auth/google/callback` (development)
     - `https://yourdomain.com/api/auth/google/callback` (production)
5. Click "Create"
6. Copy the **Client ID** and **Client Secret**

### Step 4: Update Environment Variables

**Backend (.env):**

```
GOOGLE_CLIENT_ID="copy_your_client_id_here"
GOOGLE_CLIENT_SECRET="copy_your_client_secret_here"
BACKEND_URL="http://localhost:5000"  # or your production URL
FRONTEND_URL="http://localhost:3000"  # or your production URL
```

**Frontend (.env.local)** (if needed):

```
NEXT_PUBLIC_BACKEND_URL="http://localhost:5000"
```

### Step 5: Restart Services

```bash
# Backend
cd backend
npm run dev

# Frontend (in another terminal)
cd frontend
npm run dev
```

---

## 🚀 Usage

### For Users:

**On Landing Page:**

- Click "Sign in with Google" button in the hero section
- Authenticate with your Google account
- Automatic account creation if first time
- Redirected to appropriate dashboard

**On Login Page:**

- Click "Continue with Google" button below the email/password form
- Same flow as above

### OAuth Flow:

1. **Frontend**: User clicks Google button
2. **Frontend**: Calls `GET /api/auth/google/url` to get authorization URL
3. **Frontend**: Redirects user to Google login
4. **Google**: User authenticates and approves app
5. **Google**: Redirects to `GET /api/auth/google/callback?code=...`
6. **Backend**: Exchanges code for tokens
7. **Backend**: Fetches user info from Google
8. **Backend**: Creates/updates user in database
9. **Backend**: Generates JWT token
10. **Backend**: Redirects to `/auth/callback?token=...&user=...`
11. **Frontend**: Stores token and user in localStorage
12. **Frontend**: Redirects to appropriate dashboard

---

## 📋 API Endpoints

### Get Google OAuth URL

```
GET /api/auth/google/url

Response:
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

### Google OAuth Callback (Automatic)

```
GET /api/auth/google/callback?code=...

Redirects to:
/auth/callback?token=jwt_token&user=json_user_data
```

### Verify Google ID Token (Alternative)

```
POST /api/auth/google/verify

Body:
{
  "idToken": "google_id_token"
}

Response:
{
  "success": true,
  "user": {...},
  "token": "jwt_token"
}
```

---

## ✅ What Works

- ✓ Google sign-up (first time users create account)
- ✓ Google sign-in (returning users)
- ✓ Automatic user profile population from Google
- ✓ JWT token generation
- ✓ Role-based redirection (user/manufacturer/admin)
- ✓ Dark mode compatible
- ✓ Mobile responsive
- ✓ Error handling with user feedback

---

## 🐛 Troubleshooting

### "Google OAuth not configured"

- Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in backend `.env`
- Restart backend server after updating `.env`

### "Invalid redirect URI"

- Check that redirect URI in Google Cloud Console matches exactly:
  - Backend: `http://localhost:5000/api/auth/google/callback`
  - Must match your `BACKEND_URL` environment variable

### "User data not showing after login"

- Check browser console for errors
- Verify token is stored in localStorage
- Check that user data is being parsed correctly in callback

### "Keeps redirecting to login"

- Clear browser localStorage: `localStorage.clear()`
- Clear cookies if necessary
- Try incognito/private browsing

---

## 📱 Mobile Considerations

For mobile apps, consider using:

- **Google Sign-In SDK** for native apps
- **Firebase Authentication** for cross-platform
- The `verifyGoogleToken` endpoint for validating tokens from mobile SDKs

---

## 🔒 Security Notes

1. **Never** commit credentials to git
2. **Use environment variables** for all secrets
3. **Validate SSL certificates** in production
4. **Set secure cookie flags** in production
5. **Implement rate limiting** on auth endpoints
6. **Log authentication events** for security audits
7. **Use HTTPS only** in production

---

## 📚 Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com)
- [OIDC Provider Discovery](https://accounts.google.com/.well-known/openid-configuration)

---

## 🎉 Your Landing Page Now Has:

✨ **Visual Improvements:**

- High-contrast hero text with better readability
- Prominent call-to-action button with animations
- Pharmaceutical-focused background image
- Modern glass-morphism statistics cards
- Responsive design for mobile/tablet/desktop

🔐 **Authentication Options:**

- Traditional email/password login
- Google OAuth integration
- Automatic account creation
- Profile auto-fill from Google
- Role-based dashboard redirection

Enjoy! 🚀
