# AI Risk Score Quick Reference & Recommendations

## Risk Score Interpretation at a Glance

### Code Verification Risk Scores (Individual Products)

```
RISK SCALE:   0 ─────────────────────────────────────────────────── 100
              │         │          │         │        │
         GENUINE    LOW-MEDIUM    MEDIUM     HIGH    CRITICAL
          0-20       21-40        41-66      67-85    86-100
          ✅         ⚠️          🔶        🔴       🛑

0-20:   ✅ GENUINE - Authentic product
        ├─ Trust: ACCEPT
        ├─ Action: Mark used, verify product
        └─ Recommendation: No further action

21-40:  ⚠️ LOW-MEDIUM - Minor concerns
        ├─ Trust: ACCEPT WITH CAUTION
        ├─ Action: Verify details, note location
        └─ Recommendation: Monitor for patterns

41-66:  🔶 MEDIUM - Suspicious patterns
        ├─ Trust: VERIFY MANUALLY
        ├─ Action: Require verification, notify manufacturer
        └─ Recommendation: Flag for review

67-85:  🔴 HIGH - Strong counterfeit signals
        ├─ Trust: REJECT
        ├─ Action: Block code, create incident
        └─ Recommendation: Report if pattern continues

86-100: 🛑 CRITICAL - Definite fraud
        ├─ Trust: REJECT IMMEDIATELY
        ├─ Action: Block, create critical incident
        └─ Recommendation: Contact authorities
```

---

## Manufacturer Risk Scores (Batch Assessment)

```
RISK SCALE:   0 ─────────────────────────────────────────────────── 100
              │         │          │         │
        TRUSTWORTHY  ACCEPTABLE  CONCERNING UNRELIABLE
          0-30       31-50       51-70      71-100
          ✅         ✅          ⚠️         🔴

0-30:   ✅ TRUSTWORTHY
        ├─ Genuine Rate: >90%
        ├─ Oversight: Quarterly audits
        └─ Recommendation: Fast-track approvals, premium status

31-50:  ✅ ACCEPTABLE
        ├─ Genuine Rate: 80-90%
        ├─ Oversight: Quarterly audits
        └─ Recommendation: Standard processing, monitor

51-70:  ⚠️ CONCERNING
        ├─ Genuine Rate: 60-80%
        ├─ Oversight: Monthly audits
        └─ Recommendation: Increased oversight required

71-100: 🔴 UNRELIABLE
        ├─ Genuine Rate: <60%
        ├─ Oversight: Weekly audits
        └─ Recommendation: Suspend operations, investigate
```

---

## How Risk Scores Are Calculated

### Rule-Based Detection (Always Active)

```
BASE RISK = 0

+ 50 points:  Multiple locations in 1 hour
+ 40 points:  High verification frequency (>2/hour)
+ 35 points:  Geographic clustering (>3 states)
+ 25 points:  Unregistered products with repetition
+ 60 points:  Mixed genuine/counterfeit patterns
+ 20 points:  Verifications at odd hours (11 PM - 6 AM)

SUBTOTAL (Capped at 100)
    ↓
AI Enhancement (GPT-3.5 if enabled)
    ↓
FINAL RISK SCORE (0-100)
```

### AI Enhancement Layer

When `ENABLE_AI_RISK=true`:

- GPT-3.5 analyzes verification patterns
- Provides natural language advisories
- Takes the HIGHER of rule-based vs AI score
- Falls back to rule-based if AI fails

---

## Real-World Examples

### Example 1: Genuine Product

```
Code: PHARMA-12345
Location: Lagos, Nigeria (6.5244, 3.3792)
Time: 2:00 PM Wednesday
Verification History: 1st time

ANALYSIS:
- Code found in database: ✅
- Not previously used: ✅
- Not expired: ✅
- Single location: ✅
- Normal hours: ✅
- Normal frequency: ✅

RISK SCORE: 12 (GENUINE)
DECISION: ✅ ACCEPT
RESULT: Code marked as used, user sees "Product verified"
```

### Example 2: Suspicious Activity

```
Code: PHARMA-12345
Location: Port Harcourt, Nigeria (4.7527, 7.0007)
Time: 3:00 AM Thursday
Verification History: Same code verified in Lagos 1 hour ago

ANALYSIS:
- Code already used once: ⚠️ (+0 base, CODE_ALREADY_USED)
- Multiple locations in 1 hour: ✅ (+50)
- Distance: 500+ km in 1 hour: ✅ (+25 from AI)
- Unusual time (3 AM): ✅ (+20)

SUBTOTAL: 50 + 25 + 20 = 95 → Capped at 100

RISK SCORE: 72 (After AI enhancement)
DECISION: 🔴 REJECT
ADVISORY: "Impossible travel detected - code verified across distant locations too quickly"
RESULT:
  - Code blocked
  - Incident created
  - Manufacturer notified
  - Admin alerted
```

### Example 3: Manufacturing Defect

```
Code: PHARMA-BATCH456 (Entire batch)
Verification Summary (Last 7 days):
- 150 verifications total
- 140 GENUINE (93%)
- 10 EXPIRED (7%)
- Genuine Rate: 93%

MANUFACTURER AUDIT:
- Genuine verifications: 93% ✅
- Geographic spread: Normal ✅
- Time distribution: Normal ✅
- Expiration rate: 7% (slightly high but acceptable)

MANUFACTURER RISK SCORE: 22
DECISION: ✅ TRUSTWORTHY
RECOMMENDATION: Continue standard processing, note expiration rate
```

### Example 4: Counterfeit Operation

```
Code: PHARMA-XYZ789 (Suspected batch)
Verification Summary (Last 30 days):
- 500 verifications total
- 45 GENUINE (9%)
- 400 SUSPICIOUS_PATTERN (80%)
- 55 CODE_ALREADY_USED (11%)
- Genuine Rate: 9%

MANUFACTURER AUDIT:
- Genuine Rate: 9% ❌ (Target: >90%)
- Geographic Spread: 25+ countries ⚠️
- Suspicious Patterns: 80% of verifications
- Time Clustering: Mostly overnight hours
- Risk Assessment: CRITICAL

MANUFACTURER RISK SCORE: 92
DECISION: 🔴 UNRELIABLE
ACTIONS TAKEN:
  1. Suspend manufacturer account
  2. Block all codes from this batch
  3. Create critical incident
  4. Notify law enforcement
  5. Alert trading partners
RECOMMENDATION: Immediate investigation required
```

---

## Recommended Actions by Risk Score

### For Consumers/Users

| Risk Score | What They See                           | Action Taken                          |
| ---------- | --------------------------------------- | ------------------------------------- |
| 0-20       | ✅ "Product Verified - Authentic"       | Use product immediately               |
| 21-40      | ✅ "Product Verified with Notes"        | Use but report if issues found        |
| 41-66      | ⚠️ "Verification Pending - Please Wait" | Contact manufacturer for confirmation |
| 67-85      | 🚫 "Counterfeit Detected - Do Not Use"  | Return to retailer, report batch      |
| 86-100     | 🛑 "ALERT: Report to Authorities"       | Call authorities, provide batch info  |

### For Manufacturers

| Risk Score | Oversight Level | Audit Frequency | Actions                 |
| ---------- | --------------- | --------------- | ----------------------- |
| 0-30       | Standard        | Quarterly       | None - maintain quality |
| 31-50      | Standard        | Quarterly       | Monitor for increases   |
| 51-70      | Enhanced        | Monthly         | Review supply chain     |
| 71-100     | Critical        | Weekly          | Investigate immediately |

### For Admins

| Risk Score | Priority | Investigation Time | Escalation                     |
| ---------- | -------- | ------------------ | ------------------------------ |
| 0-40       | Low      | As needed          | None                           |
| 41-66      | Medium   | 24-48 hours        | Manufacturer contact           |
| 67-85      | High     | 2-4 hours          | Law enforcement                |
| 86-100     | Critical | <1 hour            | Authorities + Trading Partners |

---

## Key Metrics to Monitor

### System Health Indicators

```
METRIC                          TARGET      RED ALERT
─────────────────────────────────────────────────────
Genuine Verification Rate       >90%        <80%
False Positive Rate             <5%         >10%
Average Risk Score              <35         >50
Critical Incidents/Week         <5          >15
AI Processing Time              <2s         >5s
Code Reuse Detection Rate       >95%        <85%
Manufacturer Trust Score        >60 avg     <40 avg
```

### Query Examples for Monitoring

```sql
-- Daily risk score averages
SELECT DATE(created_at) as date,
       AVG(risk_score) as avg_risk,
       COUNT(*) as verifications
FROM verification_log
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY date
ORDER BY date DESC;

-- Manufacturers trending towards unreliable
SELECT id, name, risk_score, last_risk_assessment
FROM manufacturer
WHERE risk_score > 70
  AND last_risk_assessment > DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY risk_score DESC;

-- High-risk patterns emerging
SELECT code_value, COUNT(*) as attempts,
       AVG(risk_score) as avg_risk,
       MIN(created_at) as first_seen,
       MAX(created_at) as last_seen
FROM verification_log
WHERE risk_score > 60
  AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY code_value
HAVING attempts >= 5
ORDER BY avg_risk DESC;
```

---

## Quick Setup Checklist

- [ ] Set `ENABLE_AI_RISK=true` in environment
- [ ] Configure `OPENAI_API_KEY` for GPT-3.5 integration
- [ ] Set risk thresholds appropriate for your market
- [ ] Add database indexes for performance
- [ ] Configure monitoring alerts
- [ ] Train support team on risk scores
- [ ] Create incident response procedures
- [ ] Set up admin dashboard alerts
- [ ] Schedule weekly manufacturer audits
- [ ] Plan quarterly model evaluation

---

## Support & Escalation

### When to Investigate

- **Risk Score >67**: Investigate within 2-4 hours
- **Manufacturer Risk >70**: Investigate within 24 hours
- **Multiple High-Risk Codes from Same Batch**: Immediate investigation
- **Geographic Impossibilities**: Immediate investigation
- **Sudden Risk Score Spike**: Review within 1 hour

### Who to Contact

| Situation         | Team                   | Timeframe |
| ----------------- | ---------------------- | --------- |
| Risk 41-66        | Manufacturer Relations | 24-48h    |
| Risk 67-85        | Compliance/Legal       | 2-4h      |
| Risk 86-100       | Law Enforcement        | <1h       |
| Pattern Detection | Operations             | Immediate |
| System Issues     | Technical Support      | ASAP      |

---

## Final Notes

✅ **Risk scores are not binary** - they provide a spectrum of confidence
✅ **Context matters** - Same score can have different meanings for different products
✅ **Monitor trends** - Watch for emerging patterns, not just individual high scores
✅ **False positives happen** - Build human review into your process for 41-66 range
✅ **Keep improving** - Regularly review rule weights and AI model performance
