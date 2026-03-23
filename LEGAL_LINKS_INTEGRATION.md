# Adding Legal Links to Navigation & Footer

## Quick Integration Guide

### Option 1: Add to Footer (Recommended)

Find or create your footer component:

```jsx
// components/Footer.js
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Company Info */}
        <div>
          <h3 className="font-bold text-lg mb-4">Lumora</h3>
          <p className="text-gray-400 text-sm">
            Protecting authentic products with cutting-edge verification
            technology.
          </p>
        </div>

        {/* Helpful Links */}
        <div>
          <h4 className="font-semibold mb-4">Navigation</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <Link href="/" className="hover:text-white">
                Home
              </Link>
            </li>
            <li>
              <Link href="/verify" className="hover:text-white">
                Verify Product
              </Link>
            </li>
            <li>
              <Link href="/report" className="hover:text-white">
                Report Counterfeit
              </Link>
            </li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <a href="mailto:support@lumora.com" className="hover:text-white">
                Support
              </a>
            </li>
            <li>
              <a href="mailto:contact@lumora.com" className="hover:text-white">
                Contact
              </a>
            </li>
            <li>
              <Link href="/blog" className="hover:text-white">
                Blog
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-semibold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <Link href="/legal" className="hover:text-white">
                Legal Hub
              </Link>
            </li>
            <li>
              <Link href="/legal/terms" className="hover:text-white">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link href="/legal/privacy" className="hover:text-white">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
        <p>&copy; 2026 Lumora. All rights reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="/legal/privacy" className="hover:text-white">
            Privacy Policy
          </a>
          <a href="/legal/terms" className="hover:text-white">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}
```

### Option 2: Add to Navbar/Header

```jsx
// components/Navbar.js (or similar)

{
  /* Navigation */
}
<nav className="flex gap-8">
  {/* ... existing nav items */}

  {/* Legal Links - Mobile: Hidden, Desktop: Visible */}
  <div className="hidden md:flex gap-4">
    <Link href="/legal" className="text-gray-600 hover:text-gray-900">
      Legal
    </Link>
    <Link href="/legal/privacy" className="text-gray-600 hover:text-gray-900">
      Privacy
    </Link>
  </div>
</nav>;
```

### Option 3: Mobile Menu Addition

```jsx
// Add to mobile menu/drawer
<ul className="space-y-2">
  {/* ... existing menu items */}

  <li className="border-t pt-4">
    <h3 className="font-semibold text-sm text-gray-600 mb-2">Legal</h3>
    <ul className="space-y-1 ml-4">
      <li>
        <Link
          href="/legal"
          className="text-sm text-gray-600 hover:text-blue-600"
        >
          Legal Hub
        </Link>
      </li>
      <li>
        <Link
          href="/legal/terms"
          className="text-sm text-gray-600 hover:text-blue-600"
        >
          Terms & Conditions
        </Link>
      </li>
      <li>
        <Link
          href="/legal/privacy"
          className="text-sm text-gray-600 hover:text-blue-600"
        >
          Privacy Policy
        </Link>
      </li>
    </ul>
  </li>
</ul>
```

---

## Integration Points

### 1. After Login Pages

Add footer with legal links below:

- `frontend/app/auth/login/page.js`
- `frontend/app/auth/register/page.js`
- `frontend/app/nafdac/login/page.js`
- `frontend/app/admin/login/page.js`

### 2. Main Landing Page

- `frontend/app/page.js` - Add footer with legal links

### 3. Dashboard Pages

- All dashboard pages should inherit footer from layout
- `frontend/app/layout.js` - Add footer component to root layout

---

## Usage Patterns

### Pattern 1: Always Visible Footer

Place footer in root layout so it's on every page:

```jsx
// frontend/app/layout.js
import Footer from "@/components/Footer";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Footer />
      </body>
    </html>
  );
}
```

### Pattern 2: Conditional Footer

Only show footer on certain pages:

```jsx
// frontend/app/page.js
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <main>...</main>
      <Footer />
    </>
  );
}
```

---

## Styling Best Practices

### Dark Mode Support

```jsx
<Link
  href="/legal/privacy"
  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
>
  Privacy Policy
</Link>
```

### Responsive Design

```jsx
{
  /* Hide on mobile, show on desktop */
}
<div className="hidden md:block">
  <Link href="/legal/privacy">Privacy</Link>
</div>;

{
  /* Show on all sizes */
}
<Link href="/legal">Legal</Link>;
```

### Icon + Text

```jsx
import { FiShield } from "react-icons/fi";

<Link
  href="/legal/privacy"
  className="flex items-center gap-2 hover:text-white"
>
  <FiShield className="w-4 h-4" />
  Privacy Policy
</Link>;
```

---

## SEO Best Practices

### Add to Sitemap

If you have a sitemap generator, include:

- `/legal`
- `/legal/terms`
- `/legal/privacy`

### Add Meta Tags

```jsx
// frontend/app/legal/terms/page.js
export const metadata = {
  title: "Terms & Conditions - Lumora",
  description: "Read Lumora's Terms & Conditions and user agreement.",
  robots: "index, follow",
};

// frontend/app/legal/privacy/page.js
export const metadata = {
  title: "Privacy Policy - Lumora",
  description:
    "Learn how Lumora collects, uses, and protects your personal data.",
  robots: "index, follow",
};
```

---

## Testing Checklist

- [ ] Legal links visible in footer
- [ ] Legal links visible in navigation
- [ ] Links open in new tab (if using `target="_blank"`)
- [ ] Pages load correctly
- [ ] Dark mode works on legal pages
- [ ] Responsive on mobile/tablet
- [ ] Links from signup page work
- [ ] Pages are SEO indexed

---

## Example Footer Component (Complete)

Save this as `components/Footer.js`:

```jsx
"use client";

import Link from "next/link";
import { FiMail, FiMapPin, FiPhone } from "react-icons/fi";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
              Lumora
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Protecting authentic products with AI-powered verification
              technology.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              Product
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/verify"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Verify Products
                </Link>
              </li>
              <li>
                <Link
                  href="/report"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Report Counterfeit
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/manufacturer"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  For Manufacturers
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              Company
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:support@lumora.com"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2"
                >
                  <FiMail className="w-4 h-4" />
                  Support
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@lumora.com"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2"
                >
                  <FiMail className="w-4 h-4" />
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/legal"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Legal Hub
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/terms"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/privacy"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <p>&copy; {currentYear} Lumora. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link
              href="/legal/privacy"
              className="hover:text-gray-900 dark:hover:text-white"
            >
              Privacy
            </Link>
            <Link
              href="/legal/terms"
              className="hover:text-gray-900 dark:hover:text-white"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

---

## Next Steps

1. Choose footer/header integration approach
2. Create or update `components/Footer.js`
3. Add to your layout or pages
4. Test links and navigation
5. Verify responsive design
6. Check dark mode support

---

**Note:** Users can access legal pages directly or through navigation. Make sure they're easy to find!
