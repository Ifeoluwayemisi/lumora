# Integration Complete: Webhook, Rate Limiting, and Analytics

## Overview

Successfully integrated **webhook notifications**, **per-agency rate limiting**, and **daily analytics snapshots** into the Lumora flagging system. The system now routes alerts to the correct regulatory agencies, respects rate limits, and collects comprehensive analytics data.

---

## 🏗️ Architecture

### 1. **Webhook Notification Service** (`webhookNotificationService.js`)

**Purpose**: Securely deliver flagged code notifications to regulatory agencies via webhooks

**Key Features**:
- ✅ **HMAC-SHA256 Signatures**: All payloads signed for authenticity verification
- ✅ **Exponential Backoff Retry**: Automatic retry up to 3 times with exponential delay
- ✅ **Delivery Tracking**: Full logging of all webhook attempts with status and response codes
- ✅ **Custom Headers**: Support for agency-specific header configurations
- ✅ **Timeout Management**: Configurable timeouts (default 30s) to prevent hanging

**Functions**:
```javascript
sendWebhookNotification(flagData)           // Main entry point
sendWebhookWithRetry(webhook, payload...)  // Retry logic with exponential backoff
generateWebhookSignature(payload, secret)  // HMAC-SHA256 generation
logWebhookDelivery(webhookId, info)       // Track delivery attempts
updateWebhookSuccessRate(webhookId)       // Calculate success metrics
```

**Example Payload**:
```json
{
  "timestamp": "2026-01-29T18:45:00.000Z",
  "agency": "NAFDAC",
  "alert": {
    "codeValue": "ABC123XYZ",
    "reason": "counterfeit",
    "severity": "high",
    "manufacturerName": "Pharma Corp",
    "manufacturerId": "mfg_12345",
    "productCategory": "drugs"
  }
}
```

### 2. **Rate Limiting Service** (`initializeAgencies.js`)

**Purpose**: Prevent overwhelming agencies with too many alerts through per-agency limits

**Limits Per Agency**:
- **Hourly**: 100 alerts/hour
- **Daily**: 1000 alerts/day
- **Throttling**: When limits exceeded, agency throttled for 1 hour

**Counter Reset**:
- Automatic hourly reset at top of each hour
- Automatic daily reset at midnight
- Database tracks reset times for consistency

**Functions**:
```javascript
initializeAgencies()              // Create rate limit records on startup
resetHourlyCounters()            // Reset hourly counters at hour boundaries
resetDailyCounters()             // Reset daily counters at day boundaries
```

### 3. **Analytics Jobs** (`analyticsJobs.js`)

**Purpose**: Collect daily snapshots of alert patterns and manufacturer distribution

**Data Collected**:

**Category Distribution**:
- Daily count of manufacturers by category (drugs, food, cosmetics, other)
- Historical trend tracking for dashboard

**Agency Flag Analytics**:
- Total flagged codes per agency per day
- Severity breakdown (critical/high/medium/low)
- Reason breakdown (suspicious/counterfeit/blacklist)
- Manufacturer breakdown

**Functions**:
```javascript
createCategoryDistributionSnapshot()    // Daily category counts
createAgencyFlagAnalytics()            // Daily agency statistics
runAnalyticsJobs()                     // Runs both jobs together
```

---

## 📊 Integration into Flag Flow

When a code is flagged via `/api/codes/{codeId}/flag`:

```
1. ✓ Code marked as flagged
2. ✓ Send admin notification email
3. ✓ Get regulatory body for product category
4. ✓ Send regulatory alert notification
5. ✓ FOR EACH AGENCY:
   └─ Check rate limit status
      ├─ If throttled: Log and skip
      ├─ If limit exceeded: Activate throttle (1 hour) and skip
      └─ If allowed:
         ├─ Send webhook notification
         ├─ Log delivery attempt
         ├─ Increment hourly counter
         └─ Increment daily counter
```

**Code Location**: `codeController.js` lines 165-240 (flagCode function)

---

## ⚙️ Server Initialization

**On startup** (`server.js`):

1. **Initialize Agencies**
   - Creates rate limit records for NAFDAC, FIRS, NAFDAC-COSMETICS
   - Sets hourly and daily counters to 0
   - Calculates next reset times

2. **Setup Background Jobs**
   - Hourly counter reset job (every 60 minutes)
   - Daily counter reset job (every 24 hours)
   - Analytics snapshot job (daily at midnight)

**Initialization Code**:
```javascript
await initializeAgencies();                    // Creates rate limit records

// Background jobs
setInterval(resetHourlyCounters, 60*60*1000);           // Every hour
setInterval(resetDailyCounters, 24*60*60*1000);        // Every day
setInterval(runAnalyticsJobs, 24*60*60*1000);          // Every day
```

---

## 🗄️ Database Schema

### New Models Added

**RegulatoryWebhook**:
```prisma
model RegulatoryWebhook {
  id                    String
  agency                String        @unique
  webhookUrl            String        @unique
  isActive              Boolean
  secret                String
  retryAttempts         Int
  retryIntervalSeconds  Int
  timeoutSeconds        Int
  headers               Json?
  successRate           Int?
  lastSuccessfulWebhook DateTime?
  lastFailedWebhook     DateTime?
}
```

**WebhookLog**:
```prisma
model WebhookLog {
  id              String
  webhookId       String
  status          String      // "success" or "failed"
  responseStatus  Int?
  attemptNumber   Int
  message         String?
  deliveredAt     DateTime?
  createdAt       DateTime
}
```

**AgencyRateLimit**:
```prisma
model AgencyRateLimit {
  id                String
  agency            String      @unique
  alertsPerHour     Int         @default(100)
  alertsPerDay      Int         @default(1000)
  currentHourCount  Int         @default(0)
  currentDayCount   Int         @default(0)
  isThrottled       Boolean     @default(false)
  throttleUntil     DateTime?
  hourlyResetAt     DateTime
  dailyResetAt      DateTime
}
```

**AgencyFlagAnalytics**:
```prisma
model AgencyFlagAnalytics {
  id                  String
  agency              String
  date                DateTime    @db.Date
  totalFlaggedCodes   Int
  severityBreakdown   Json        // {"critical": 5, "high": 10, ...}
  reasonBreakdown     Json        // {"counterfeit": 8, "suspicious": 7, ...}
  
  @@unique([agency, date])
}
```

**CategoryDistributionSnapshot**:
```prisma
model CategoryDistributionSnapshot {
  id          String
  snapshotDate DateTime    @db.Date @unique
  drugs       Int
  food        Int
  cosmetics   Int
  other       Int
  totalCount  Int
  createdAt   DateTime
}
```

---

## 📡 Admin API Endpoints

All endpoints require admin authentication and are under `/api/admin/`

### Analytics Endpoints
- `GET /analytics/category-distribution` - Current manufacturer distribution
- `GET /analytics/category-history?days=30` - Historical trends
- `GET /analytics/manufacturers` - Breakdown by category
- `GET /analytics/agencies?days=30` - All agencies statistics
- `GET /analytics/agencies/:agency?days=30` - Specific agency report

### Rate Limit Management
- `GET /management/rate-limits` - All agencies status
- `GET /management/rate-limits/:agency` - Specific agency limits
- `PUT /management/rate-limits/:agency` - Update limits

### Webhook Management
- `GET /management/webhooks/:agency/config` - Get configuration
- `POST /management/webhooks/:agency/register` - Register webhook
- `GET /management/webhooks/:agency/logs` - Delivery logs
- `PATCH /management/webhooks/:agency/toggle` - Enable/disable

---

## 🧪 Testing

Run integration test to verify all components:

```bash
cd backend
node test-integration.js
```

Expected output:
```
✅ All integration tests passed!

Integration Summary:
  1. Webhook notification service: Ready
  2. Rate limiting initialization: Ready
  3. Analytics jobs: Ready
  4. Code controller integration: Ready
```

---

## 📈 Monitoring & Logging

All operations include detailed logging with prefixes:

- **[WEBHOOK]** - Webhook delivery attempts and status
- **[RATE_LIMIT]** - Rate limit checks and counter updates
- **[ANALYTICS_JOB]** - Daily snapshot collection
- **[FLAG_CODE]** - Code flagging operations

Example logs:
```
[INIT] Initializing agency records...
[INIT] Created rate limit record for NAFDAC
[INIT] Agency initialization complete

[RATE_LIMIT] Reset hourly counters for 3 agencies
[ANALYTICS_JOB] Creating category distribution snapshot...
[ANALYTICS_JOB] Created new category distribution snapshot

[FLAG_CODE] Regulatory alert sent to NAFDAC
[WEBHOOK] ✓ Delivered to NAFDAC (attempt 1)
[WEBHOOK] Counters updated for NAFDAC
```

---

## ✅ Completion Status

- ✅ Webhook notification service created with full retry logic
- ✅ Rate limiting per agency with hourly/daily counters
- ✅ Throttling mechanism when limits exceeded
- ✅ Analytics snapshot collection (daily)
- ✅ Agency initialization on server startup
- ✅ Background jobs for counter reset and analytics
- ✅ Integration into code flagging workflow
- ✅ Admin API endpoints for management
- ✅ Full logging and error handling
- ✅ Integration tests passing

---

## 🚀 Next Steps

1. **Frontend Dashboards** - Already created and ready to use
   - Category Distribution Dashboard
   - Agency Reports Dashboard
   - Rate Limiting & Webhooks Management

2. **Webhook Registration** - Admins can register agency webhooks via:
   - Admin dashboard webhook management panel
   - API endpoint: `POST /api/admin/management/webhooks/:agency/register`

3. **Production Deployment**
   - Set up webhook URLs for each agency
   - Configure database backups
   - Monitor logs and success rates
   - Adjust rate limits based on actual usage

---

## 📚 File Reference

| File | Purpose | Lines |
|------|---------|-------|
| `webhookNotificationService.js` | Webhook delivery with retry | 165 |
| `analyticsJobs.js` | Daily analytics collection | 145 |
| `initializeAgencies.js` | Startup initialization | 115 |
| `codeController.js` | Flag flow integration | 520 (updated) |
| `server.js` | Background job setup | 121 (updated) |
| `adminAnalyticsController.js` | Admin API handlers | 598 |
| `adminAnalytics.js` | Route definitions | 137 |

