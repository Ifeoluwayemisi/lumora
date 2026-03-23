# Email Configuration Setup

## Why Emails Aren't Sending

You're not receiving emails (forgot password, manufacturer approval) because the **email environment variables are not configured**. The system is set up to send emails, but without proper credentials, it can't actually send them.

## Quick Setup

### Step 1: Create `.env.local` in Backend

Create a file at `backend/.env.local` with these email variables:

```env
# ============================================
# EMAIL CONFIGURATION
# ============================================

# Gmail SMTP Configuration (Recommended)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Alternative: Outlook/Office365
# SMTP_HOST=smtp-mail.outlook.com
# SMTP_PORT=587
# SMTP_SECURE=false
# EMAIL_USER=your-email@outlook.com
# EMAIL_PASS=your-password

# Alternative: Custom SMTP Server
# SMTP_HOST=mail.yourdomain.com
# SMTP_PORT=587
# SMTP_SECURE=false
# EMAIL_USER=your-email@yourdomain.com
# EMAIL_PASS=your-password

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000
```

### Step 2: Generate Gmail App Password

If using **Gmail** (recommended):

1. Go to [Google Account Security Settings](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (if not already enabled)
3. Go to **App passwords** section
4. Select "Mail" and "Windows Computer"
5. Copy the 16-character password
6. Use this in `EMAIL_PASS` (no spaces)

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx  # Copy this (16 chars, paste without spaces)
```

### Step 3: Run Database Migration

After creating `.env.local` with email config, run the Prisma migration to add T&C acceptance tracking fields:

```bash
cd backend

# Generate migration
npx prisma migrate dev --name add_terms_acceptance_tracking

# Or if migration already generated, just run:
npx prisma migrate deploy
```

### Step 4: Restart Backend

```bash
# Kill current backend process
# Then restart it
npm run dev
```

## What Gets Tracked Now

After setup, the system will track:

- **termsAcceptedAt** - When user accepts T&C during signup
- **privacyAcceptedAt** - When user accepts Privacy Policy (future)

## Test Email Functionality

### Test Password Reset Email

1. Go to Login page
2. Click "Forgot Password?"
3. Enter email address
4. Check your inbox for reset link
5. Should arrive within 1-2 minutes

### Test Manufacturer Approval Email

1. In Admin Dashboard, go to Manufacturers
2. Approve a pending manufacturer
3. Manufacturer should receive approval email

## Troubleshooting

### Email not sent - Check Backend Logs

```bash
cd backend
npm run dev
```

Look for this warning:

```
⚠️ Email service not configured
```

### Email Authentication Failed

- Verify your SMTP_HOST is correct
- Make sure EMAIL_USER and EMAIL_PASS are correct
- For Gmail: Use App Password (not regular password)
- Check if 2-factor authentication is enabled

### Still Not Working?

1. Check backend logs for detailed error message
2. Verify email credentials in `.env.local`
3. Test with a different email provider (Outlook, SendGrid)
4. Make sure backend is restarted after env changes

## Alternative: SendGrid (Recommended for Production)

For production, use SendGrid (free tier available):

1. Sign up at [SendGrid](https://sendgrid.com)
2. Create API Key
3. Use in `.env.local`:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=SG.your-api-key-here
```

## Files Updated for T&C Tracking

1. **Database:**
   - `backend/prisma/schema.prisma` - Added `termsAcceptedAt` and `privacyAcceptedAt` fields

2. **Frontend:**
   - `frontend/app/auth/register/page.js` - Links now point to `/legal/terms` and `/legal/privacy`

3. **Backend:**
   - `backend/src/controllers/authController.js` - Now saves when user accepts T&C

## Next: Manufacturer Dashboard Map

The manufacturer dashboard currently displays country as text. For location mapping:

Option 1: Display on map (requires map library)
Option 2: Keep as text with location details
Option 3: Add geolocation features to manufacturer profile

Check `MANUFACTURER_MAP_FIX.md` for details.
