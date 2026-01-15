# 🎨 Lumora Frontend - Visual User Journey Map

**Complete User Experience Flow - All Pages & Features**

---

## 📱 MOBILE FIRST (≤768px)

```
┌─────────────────────────────────┐
│           LANDING PAGE          │
│         (Landing Hero)          │
│   "Verify. Protect. Save Lives" │
│         [Features]              │
│         [Benefits]              │
│         [Pricing]               │
│                                 │
│  [Sign Up] [Login] [Verify] ⬇️  │
└─────────────────────────────────┘
        │         │         │
        ▼         ▼         ▼
    ┌────┐  ┌────┐  ┌────────────┐
    │SIGN│  │LOGIN│  │VERIFY      │
    │UP  │  │PAGE │  │(Manual)    │
    │PAGE│  └────┘  └────────────┘
    └────┘            ▼
      │      ┌──────────────────┐
      │      │ Enter Code       │
      │      │ [Input Field]    │
      │      │ [Verify Button]  │
      │      └──────────────────┘
      │              ▼
      │      ┌──────────────────┐
      │      │RESULT PAGE       │
      │      │                  │
      │      │ ✅ Genuine      │
      │      │ Code: ABC123     │
      │      │ Risk: Low        │
      │      │                  │
      │      │ [Add Favorite] 🔒│
      │      │ [Re-verify]      │
      │      │ [Back]           │
      │      └──────────────────┘
      │              ▼
      └─────▶[CREATE ACCOUNT]
               ▼
         [CONFIRM EMAIL]
             ▼
         [DASHBOARD] 🏠
             │
     ┌───────┴───────────────────┐
     │                           │
     ▼                           ▼
 [HISTORY]                   [PROFILE]
 📜                          👤
 List all verifications      Edit name/email
 [Re-verify buttons]         Change password
                             Delete account

     │
     ▼
 [FAVORITES]
 ⭐
 Saved codes
 Quick re-verify

     │
     ▼
 [NOTIFICATIONS]
 🔔
 System alerts
 Security notices

BOTTOM NAVIGATION (Mobile Only):
┌─────────────────────────────────┐
│ 🏠     📜     ⭐      👤        │
│HOME  HISTORY FAVORITES PROFILE   │
└─────────────────────────────────┘
(Fixed at bottom, always visible)
```

---

## 🖥️ DESKTOP (≥768px)

```
┌─────────────────────────────────────────────────────────┐
│                  TOP NAVIGATION BAR                      │
│ [LOGO] [Verify] [How It Works] [About]   [Login] [Sign] │
└─────────────────────────────────────────────────────────┘

                    LANDING PAGE
             ┌─────────────────────────┐
             │   Hero Section          │
             │   "Fight Counterfeits"  │
             │                         │
             │   [How It Works]        │
             │   [Solutions]           │
             │   [About Us]            │
             │   [Pricing]             │
             │   [Contact]             │
             │                         │
             │   [Get Started] CTA     │
             └─────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
    [LOGIN]     [REGISTER]  [VERIFY]
    ┌──────┐   ┌────────┐   ┌──────┐
    │Email │   │Email   │   │Code  │
    │Pass  │   │Name    │   │[Scan]│
    │[Login]   │Pass    │   │[Enter]
    │[Register]│[Create]│   │[QR]  │
    └──────┘   └────────┘   └──────┘
        │           │           │
        └───────────┴───────────┘
                    │
                    ▼
          [VERIFICATION RESULT]
          ┌──────────────────────────┐
          │ Status: ✅ GENUINE       │
          │ Code: ABC123XYZ          │
          │ Brand: Paracetamol       │
          │ Risk Score: 15/100 🟢    │
          │ Expiry: Jan 2025         │
          │                          │
          │ [Add to Favorites] ⭐    │
          │ [View Full Details]      │
          │ [Share Result]           │
          │ [New Scan]               │
          └──────────────────────────┘
                    │
                    ▼
    ┌─────────────────────────────────────┐
    │     DASHBOARD (After Login)         │
    │                                     │
    │  SIDEBAR (Left - Fixed 256px)   │   MAIN CONTENT (Right)
    │  ────────────────────────────   │   ──────────────────────
    │  🏠 Dashboard                   │   📊 Dashboard Stats
    │  📜 History                     │   [Cards showing]
    │  ⭐ Favorites                   │   - Total Verifications
    │  🔔 Notifications               │   - Genuine vs Risky
    │  👤 Profile                     │   - Charts & Analytics
    │  ⚙️  Settings                   │
    │  🚪 Logout                      │
    │                                 │
    └────────────────────────────────┐   HISTORY PAGE
                                     │   ──────────────────────
                                     │   📜 All Verifications
                                     │   ┌──────────────────┐
                                     │   │ Code: ABC123     │
                                     │   │ Status: Genuine  │
                                     │   │ Date: Jan 10     │
                                     │   │ [Re-verify] Btn  │
                                     │   └──────────────────┘
                                     │   ┌──────────────────┐
                                     │   │ Code: XYZ789     │
                                     │   │ Status: Risky    │
                                     │   │ Date: Jan 9      │
                                     │   │ [Re-verify] Btn  │
                                     │   └──────────────────┘
                                     │   [Pagination/Load More]
                                     │
                                     │   FAVORITES PAGE
                                     │   ──────────────────────
                                     │   ⭐ Saved Products
                                     │   [Same card layout]
                                     │   [Remove from favorites]
                                     │
                                     │   NOTIFICATIONS PAGE
                                     │   ──────────────────────
                                     │   🔔 Your Alerts
                                     │   - New suspicious patterns
                                     │   - Product recalls
                                     │   - Account updates
                                     │
                                     │   PROFILE PAGE
                                     │   ──────────────────────
                                     │   👤 Edit Profile
                                     │   ┌──────────────────┐
                                     │   │ Name:   [Input]  │
                                     │   │ Email:  [Input]  │
                                     │   │ [Save] [Cancel]  │
                                     │   └──────────────────┘
                                     │
                                     │   🔐 Change Password
                                     │   ┌──────────────────┐
                                     │   │ Current: [Input] │
                                     │   │ New:     [Input] │
                                     │   │ Confirm: [Input] │
                                     │   │ [Update]         │
                                     │   └──────────────────┘
                                     │
                                     │   ⚠️  DELETE ACCOUNT
                                     │   [Dangerous Zone]
                                     │   [Delete Button]
                                     │
                                     │   SETTINGS PAGE
                                     │   ──────────────────────
                                     │   ⚙️ Preferences
                                     │   ☑️ Email Notifications
                                     │   ☐ Push Notifications
                                     │   ☑️ Weekly Digest
                                     │   ☑️ Alert on Risk
                                     │   [Save Preferences]
                                     │
                                     │   📥 DATA MANAGEMENT
                                     │   [Export as CSV]
                                     │   [Export as JSON]
                                     │   [Export as PDF]
                                     │   [Clear History]
                                     │
    └─────────────────────────────────┘
```

---

## 🔐 AUTHENTICATION FLOWS

### Sign Up Flow

```
[Landing] → [Sign Up Page]
              │
              ├─ Email input
              ├─ Password input
              ├─ Name input
              ├─ Agree to terms
              │
              ▼
         [Submit Button]
              │
              ├─ Validate input
              ├─ Check email exists
              ├─ Hash password
              │
              ▼
         [Success Page]
              │
              └─→ [Login Page] or [Verify Page]
```

### Login Flow

```
[Landing/Auth] → [Login Page]
                  │
                  ├─ Email input
                  ├─ Password input
                  │
                  ▼
             [Submit Button]
                  │
                  ├─ Validate credentials
                  ├─ Return JWT token
                  ├─ Store in localStorage
                  ├─ Save to AuthContext
                  │
                  ▼
    [Dashboard] (AuthGuard checks token)
                  │
                  ├─ Token exists? ✅
                  ├─ Token valid? ✅
                  ├─ Role authorized? ✅
                  │
                  └─→ Render Dashboard
```

### Error Cases

```
Invalid Credentials
    ↓
Toast Error Message
    ↓
User stays on login page
    ↓
[Forgot Password] link available

Missing Token (after redirect)
    ↓
AuthGuard detects no token
    ↓
Redirect to Login
    ↓
[Sign Up] link available

Invalid Role
    ↓
Unauthorized Page (403)
    ↓
[Contact Support] info shown
```

---

## 🎨 COLOR & STYLING SCHEME

```
✅ PRIMARY (Genuine/Success)
   Color: #16a34a (Green)
   Used for: Buttons, badges, positive indicators

❌ DANGER
   Color: #dc2626 (Red)
   Used for: Delete buttons, risk alerts, errors

ℹ️  SECONDARY
   Color: #3b82f6 (Blue)
   Used for: Links, secondary buttons, info

⚠️  WARNING
   Color: #f59e0b (Amber)
   Used for: Warnings, caution alerts

📊 DARK MODE
   BG: #111827 (dark-gray-950)
   Text: #ffffff (white)
   Cards: #1f2937 (dark-gray-900)
```

---

## 📊 RESPONSIVE BREAKPOINTS

```
Mobile: < 640px
├─ Single column layout
├─ Full-width cards
├─ Bottom navigation
├─ Large touch targets (44px+)
├─ Hamburger menu

Tablet: 640px - 1024px
├─ 2-column grid (cards)
├─ Sidebar hidden/collapsible
├─ Standard navigation
├─ Optimized spacing

Desktop: 1024px+
├─ 3-column grid (cards)
├─ Fixed sidebar (256px)
├─ Full navigation
├─ Multi-section layouts
```

---

## 🚨 ERROR PAGE DISPLAYS

```
401 - Unauthorized (No Token)
┌──────────────────────────────┐
│   🔒 Unauthorized            │
│                              │
│   You must log in first      │
│                              │
│   [Login] [Sign Up]          │
└──────────────────────────────┘

403 - Forbidden (Wrong Role)
┌──────────────────────────────┐
│   🚫 Access Denied           │
│                              │
│   Insufficient permissions   │
│   Contact support            │
│                              │
│   [Home] [Dashboard]         │
└──────────────────────────────┘

404 - Not Found
┌──────────────────────────────┐
│   ❓ Page Not Found          │
│                              │
│   This page doesn't exist    │
│                              │
│   [Home] [Verify]            │
└──────────────────────────────┘

500 - Server Error
┌──────────────────────────────┐
│   ⚠️  Something Went Wrong   │
│                              │
│   Error: [Error message]     │
│                              │
│   [Try Again] [Home]         │
└──────────────────────────────┘
```

---

## 🔄 COMPLETE USER JOURNEY

```
┌─────────────────────────────────────────────────────────────┐
│                    NEW USER JOURNEY                         │
└─────────────────────────────────────────────────────────────┘

1️⃣  DISCOVER
    Landing Page (/)
    │ Read benefits
    │ See how it works
    │ View pricing
    ▼

2️⃣  DECIDE
    Try as Guest? → /verify (no auth needed)
    Create Account? → /auth/register

3️⃣  REGISTER (Optional)
    /auth/register
    │ Email
    │ Password
    │ Full Name
    │ Agree Terms
    ▼

4️⃣  LOGIN
    /auth/login
    │ Email
    │ Password
    ▼

5️⃣  VERIFY
    /dashboard/user (Main Dashboard)
    ├─ Verify Manual: /verify → /verify/result
    └─ Verify QR: /verify/qr → /verify/result

    Both routes show:
    │ Product details
    │ Risk score
    │ Authenticity status
    │ Recommendations
    ▼

6️⃣  SAVE
    /dashboard/user/favorites
    │ Add to favorites (from result page)
    │ Quick access to re-verify
    │ Manage saved products
    ▼

7️⃣  TRACK
    /dashboard/user/history
    │ All verifications
    │ Timestamps
    │ Status
    │ Re-verify options
    ▼

8️⃣  MANAGE
    /dashboard/user/profile
    │ Update personal info
    │ Change password
    │ Delete account

    /dashboard/user/settings
    │ Notification preferences
    │ Export data
    │ Clear history
    ▼

9️⃣  ALERTS
    /dashboard/user/notifications
    │ System updates
    │ Security alerts
    │ Product recalls
    ▼

🔟 LOGOUT
    Clear token
    Clear context
    Redirect to /auth/login
```

---

## ✨ FEATURES AT A GLANCE

```
✅ IMPLEMENTED
├─ Manual code verification (no auth needed)
├─ QR code scanning (auth required)
├─ Verification history (auth required)
├─ Favorites/Bookmarks (auth required)
├─ Notifications (auth required)
├─ User profile management (auth required)
├─ Preference settings (auth required)
├─ Data export (auth required)
├─ Dark mode toggle
├─ Responsive design (mobile + desktop)
├─ Error handling & boundaries
├─ Authentication & authorization
└─ Password reset

🚀 READY FOR BACKEND
├─ Profile update endpoints
├─ Password change endpoints
├─ Account deletion
├─ Notification preferences
├─ Data export service
└─ History clear function
```

---

**This visual guide shows the complete user experience.**  
**All 17 pages are implemented and connected.**  
**Ready for end-to-end testing! 🚀**
