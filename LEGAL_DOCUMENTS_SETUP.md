# Legal Documents Setup Guide - Lumora

## Overview

Created customizable **Terms & Conditions** and **Privacy Policy** pages for the Lumora platform. These documents are essential for regulatory compliance and user transparency.

## Files Created

### Frontend Pages

```
frontend/app/legal/
├── page.js              # Legal hub index page (links to both T&C and Privacy)
├── layout.js            # Layout wrapper for legal pages
├── terms/page.js        # Terms & Conditions page
└── privacy/page.js      # Privacy Policy page
```

## URLs

- **Legal Hub:** `http://localhost:3000/legal`
- **Terms & Conditions:** `http://localhost:3000/legal/terms`
- **Privacy Policy:** `http://localhost:3000/legal/privacy`

## Customization Guide

### 1. **Update Company Information**

Replace placeholder email addresses:

- `legal@lumora.com` → Your actual legal email
- `privacy@lumora.com` → Your actual privacy email
- Add company address and contact details

### 2. **Update Last Modified Dates**

Look for "Last updated: March 2026" and update to current date.

### 3. **Add to Navbar/Footer**

Link from your main navigation. Example:

```jsx
// In your header/footer component
<Link href="/legal" className="text-gray-600 hover:text-gray-900">
  Legal
</Link>
<Link href="/legal/terms" className="text-gray-600 hover:text-gray-900">
  Terms & Conditions
</Link>
<Link href="/legal/privacy" className="text-gray-600 hover:text-gray-900">
  Privacy Policy
</Link>
```

### 4. **Customize for Your Use Cases**

Update these sections based on Lumora's actual practices:

**In Terms & Conditions:**

- Section 2: Modify prohibited uses
- Section 6: Adjust materials/content submission terms
- Add section for manufacturer-specific terms (QR codes, products, etc.)

**In Privacy Policy:**

- Section 2: List all data types you actually collect
- Section 3: Add specific use cases for your business logic
- Section 5: Update sharing practices (NAFDAC integration, etc.)
- Add GDPR/CCPA compliance info if needed

## Important Customizations for Lumora

### Add Manufacturer-Specific Terms

In `/terms/page.js`, add a new section:

```jsx
<section>
  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
    Manufacturer Specific Terms
  </h2>
  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
    <li>QR codes generated for products remain Lumora property</li>
    <li>Manufacturers must ensure product information accuracy</li>
    <li>Counterfeiting or misuse of QR codes is prohibited</li>
    <li>Regular audits may be conducted on manufacturer accounts</li>
  </ul>
</section>
```

### Add NAFDAC/Regulatory Info

In `/privacy/page.js`, update Section 5 (Disclosure):

```jsx
<li className="flex gap-3">
  <span className="font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0">
    •
  </span>
  <span>
    <strong>Regulatory Authorities:</strong> Product and verification data may
    be shared with NAFDAC and other regulatory bodies for compliance and quality
    assurance
  </span>
</li>
```

## Adding to Footer

Create or update your footer component:

```jsx
// components/Footer.js
export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-3 gap-8 mb-8">
          {/* Legal Links */}
          <div>
            <h3 className="font-bold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/legal/terms">Terms & Conditions</Link>
              </li>
              <li>
                <Link href="/legal/privacy">Privacy Policy</Link>
              </li>
              <li>
                <a href="mailto:legal@lumora.com">Contact Legal</a>
              </li>
            </ul>
          </div>
          {/* ... other footer sections */}
        </div>
      </div>
    </footer>
  );
}
```

## Compliance Checklist

- [ ] Update all placeholder email addresses
- [ ] Add company address information
- [ ] Customize manufacturer terms
- [ ] Update NAFDAC compliance sections
- [ ] Add links to footer/navigation
- [ ] Review with legal team (if available)
- [ ] Have legal review for GDPR/CCPA compliance
- [ ] Make accessible (mobile responsive, dark mode)
- [ ] Test all links work correctly
- [ ] Monitor compliance changes needed

## GDPR/Data Protection Additions

If your service has international users, consider adding:

### User Rights Section

```jsx
<section>
  <h2 className="text-2xl font-bold">GDPR User Rights (EU Users)</h2>
  <p>Under GDPR, EU residents have the right to:</p>
  <ul>
    <li>Request access to your personal data</li>
    <li>Request deletion (right to be forgotten)</li>
    <li>Request rectification of inaccurate data</li>
    <li>Data portability</li>
    <li>Restrict processing</li>
    <li>Object to processing</li>
  </ul>
</section>
```

## Features Implemented

✅ **Responsive Design** - Mobile, tablet, and desktop friendly
✅ **Dark Mode** - Full dark mode support
✅ **Accessible** - Keyboard navigation and screen reader friendly
✅ **Professional Layout** - Clear sections with proper spacing
✅ **Easy Navigation** - Back buttons and legal hub for easy access
✅ **Contact Info** - Clear call-to-action for legal inquiries
✅ **SEO Friendly** - Proper heading hierarchy

## Testing

```bash
# Start your Next.js frontend
cd frontend
npm run dev

# Visit URLs
# http://localhost:3000/legal
# http://localhost:3000/legal/terms
# http://localhost:3000/legal/privacy
```

## Next Steps

1. **Customize all sections** with Lumora-specific information
2. **Add to navigation** in your main header/footer
3. **Have reviewed** by legal team if available
4. **Monitor changes** - Update when policies change
5. **Add compliance tracking** - Log acceptance/agreement

---

**Important:** These are templates. Ensure they reflect your actual data practices and comply with relevant laws in your jurisdiction.
