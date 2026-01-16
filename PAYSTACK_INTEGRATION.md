# Paystack Integration Guide

## Overview

This document outlines the complete Paystack payment integration for Lumora, enabling manufacturers to upgrade from Basic to Premium plans.

## ✅ Implementation Status

### Backend Paystack Integration - COMPLETE

- ✅ `paystackService.js` - Paystack API interactions
- ✅ `paymentController.js` - Payment endpoints
- ✅ `webhookController.js` - Webhook handler for async payments
- ✅ Payment routes integrated into manufacturer routes
- ✅ Payment & Billing History models (schema updates needed)

### Frontend Paystack Integration - COMPLETE

- ✅ Paystack SDK loader
- ✅ Payment initialization via `handleUpgrade()`
- ✅ Payment popup (Paystack.pop())
- ✅ Payment verification callback
- ✅ Plan upgrade on success
- ✅ Dashboard redirect after upgrade

### Database Schema - TODO

Required tables to create:

```sql
CREATE TABLE Payment (
  id String @id @default(cuid())
  manufacturerId String
  reference String @unique
  amount Int
  planId String
  status String (pending, success, failed)
  accessCode String?
  authorizationUrl String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  manufacturer Manufacturer @relation(fields: [manufacturerId], references: [id])
)

CREATE TABLE BillingHistory (
  id String @id @default(cuid())
  manufacturerId String
  reference String
  amount Int
  planId String
  status String
  transactionDate DateTime
  createdAt DateTime @default(now())
  manufacturer Manufacturer @relation(fields: [manufacturerId], references: [id])
)
```

## Setup Instructions

### 1. Get Paystack API Keys

1. Go to https://paystack.com
2. Create account or login
3. Navigate to Settings → API Keys
4. Copy:
   - **Public Key** (starts with `pk_`)
   - **Secret Key** (starts with `sk_`)

### 2. Set Environment Variables

**Backend (.env)**

```bash
PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxx
```

**Frontend (.env.local)**

```bash
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
```

### 3. Run Database Migrations

Add Payment and BillingHistory tables to your Prisma schema:

```bash
npm run prisma:migrate
```

### 4. Configure Webhook (Production)

1. Go to Paystack Dashboard → Settings → API Keys & Webhooks
2. Add Webhook URL:
   ```
   https://yourdomain.com/api/webhooks/paystack
   ```
3. Subscribe to these events:
   - charge.success
   - charge.failed

## API Endpoints

### 1. Get Payment Configuration

```
GET /api/manufacturer/billing/config
Response:
{
  "success": true,
  "data": {
    "publicKey": "pk_live_xxx",
    "plans": [...]
  }
}
```

### 2. Initiate Payment

```
POST /api/manufacturer/billing/initiate-payment
Auth: Required
Body:
{
  "planId": "premium"
}

Response:
{
  "success": true,
  "data": {
    "authorization_url": "https://checkout.paystack.com/xxx",
    "access_code": "xxx",
    "reference": "xxx"
  }
}
```

### 3. Verify Payment

```
POST /api/manufacturer/billing/verify-payment
Auth: Required
Body:
{
  "reference": "xxx"
}

Response:
{
  "success": true,
  "message": "Plan upgraded successfully!",
  "data": {
    "plan": "PREMIUM",
    "planUpgradedAt": "2025-01-16T..."
  }
}
```

### 4. Get Billing History

```
GET /api/manufacturer/billing/history
Auth: Required
Response:
{
  "success": true,
  "data": [
    {
      "id": "xxx",
      "reference": "xxx",
      "amount": 50000,
      "planId": "premium",
      "status": "completed",
      "transactionDate": "2025-01-16T..."
    }
  ]
}
```

### 5. Paystack Webhook

```
POST /api/webhooks/paystack
Events:
- charge.success → Upgrade plan and create billing record
- charge.failed → Mark payment as failed
```

## Frontend Payment Flow

### User clicks "Upgrade"

1. Frontend calls `initiatePayment` endpoint
2. Backend creates payment record and calls Paystack API
3. Paystack returns authorization URL

### Payment Popup Opens

```javascript
window.PaystackPop.setup({
  key: PAYSTACK_PUBLIC_KEY,
  email: manufacturer.email,
  amount: 50000 * 100, // in kobo
  ref: reference,
  onSuccess: handleSuccess,
  onClose: handleClose,
});
```

### User Completes Payment

1. Paystack popup closes
2. Frontend calls `verifyAndUpgradePlan` endpoint
3. Backend verifies with Paystack and updates plan
4. Dashboard refreshes showing new Premium plan
5. User redirected to dashboard

## Testing

### Test Cards (Paystack)

```
Card: 4084 0844 0844 0844
CVV: Any 3 digits
Expiry: Any future date
Phone: Any number
```

### Test Flow

1. Click "Upgrade to Premium"
2. Complete payment with test card
3. See success message
4. Plan updates to Premium
5. Check analytics/features are now unlimited

## Troubleshooting

### Payment fails with "Invalid signature"

- Verify Secret Key is correct in .env
- Check webhook payload hasn't been modified

### Paystack popup doesn't open

- Ensure script is loaded: `https://js.paystack.co/v1/inline.js`
- Check browser console for errors
- Verify Public Key is correct

### Plan doesn't upgrade after payment

- Check database has Payment and BillingHistory tables
- Verify webhook is configured correctly
- Check backend logs for errors

### "Manufacturer not found" error

- Ensure user is authenticated
- Check JWT token is valid
- Verify manufacturerId matches logged-in user

## Security Checklist

- ✅ Webhook signature verified
- ✅ Payment reference validated
- ✅ manufacturerId ownership verified
- ✅ Amount verified before upgrade
- ✅ Auth middleware on all endpoints
- ✅ Error messages don't leak sensitive data
- ✅ Keys stored in environment variables
- ✅ HTTPS enforced in production

## Future Enhancements

1. **Recurring Billing** - Set up subscription plans
2. **Invoice Generation** - Create PDF invoices
3. **Email Receipts** - Send payment confirmations
4. **Refund Handling** - Process refunds automatically
5. **Payment History UI** - Show past transactions
6. **Plan Downgrades** - Handle step-down logic
7. **Currency Conversion** - Support multiple currencies
8. **Analytics** - Track upgrade conversion rates

## References

- [Paystack Documentation](https://paystack.com/docs)
- [Paystack API Reference](https://paystack.com/docs/api)
- [Paystack Test Cards](https://paystack.com/docs/payments/test-payments/)
