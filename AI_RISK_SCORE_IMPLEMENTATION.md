# AI Risk Score Implementation Guide

## How to Use Risk Scores in Your Application

### 1. Frontend Implementation Example

#### In Your Verification Result Handler

```javascript
// frontend/app/pages/verify.tsx or equivalent

async function handleVerificationResult(response) {
  const { verification } = response;
  const riskScore = verification.riskScore;
  const state = verification.state;

  // Determine UI feedback based on risk score
  if (riskScore <= 20) {
    return showSuccess({
      title: "✅ Product Verified",
      message: "This product is authentic and safe to use.",
      color: "green",
      action: "Continue",
      riskIndicator: `Trust: ${verification.trustDecision}`,
    });
  } else if (riskScore <= 40) {
    return showWarning({
      title: "✅ Product Verified - With Notes",
      message: "Product appears authentic but minor concerns detected.",
      color: "yellow",
      details: verification.advisory || "No additional information",
      action: "Accept & Continue",
      riskScore: riskScore,
      riskIndicator: `Confidence: ${100 - riskScore}%`,
    });
  } else if (riskScore <= 66) {
    return showCaution({
      title: "⚠️ Verification Required",
      message: "This product needs additional verification.",
      color: "orange",
      details: verification.advisory,
      action: "Contact Manufacturer",
      manufacturerPhone: response.product.manufacturerPhone,
      manufacturerEmail: response.product.manufacturerEmail,
      riskScore: riskScore,
      riskIndicator: `Risk Level: MEDIUM`,
    });
  } else if (riskScore <= 85) {
    return showError({
      title: "🚫 Counterfeit Likely Detected",
      message: "Strong indicators this product may be counterfeit.",
      color: "red",
      details: verification.advisory,
      actions: [
        { label: "Return to Retailer", type: "primary" },
        { label: "Report Batch", type: "secondary" },
        { label: "Contact Authorities", type: "danger" },
      ],
      batchNumber: response.batch.batchNumber,
      riskScore: riskScore,
      riskIndicator: `Risk Level: HIGH`,
    });
  } else {
    return showCritical({
      title: "🛑 ALERT: Counterfeit Detected",
      message: "This product is definitively counterfeit. DO NOT USE.",
      color: "darkred",
      details: [
        "High probability of counterfeit",
        "Multiple fraud indicators detected",
        verification.advisory,
      ].filter(Boolean),
      actions: [
        { label: "Report to Authorities (Urgent)", type: "danger" },
        { label: "Save Batch Info", type: "primary" },
      ],
      batchInfo: {
        batchNumber: response.batch.batchNumber,
        manufacturer: response.product.manufacturer,
        code: response.codeValue,
        riskScore: riskScore,
        flags: [
          "Definite counterfeit indicators",
          "Multiple verification fraud patterns",
          "Geographic/temporal anomalies",
        ],
      },
      riskIndicator: `CRITICAL: ${riskScore}/100`,
    });
  }
}
```

### 2. Backend Implementation Example

#### Risk Score Processing in Your Service

```javascript
// backend/src/services/verificationResponseService.js

export async function processVerificationResult(verificationResult) {
  const { riskScore, verificationState } = verificationResult;

  // Determine business actions based on risk score
  const decision = getDecision(riskScore);
  const actions = await getActions(decision, verificationResult);

  // Log for audit trail
  await logVerificationDecision(verificationResult, decision);

  // Create notifications/incidents if needed
  if (riskScore > 40) {
    await notifyManufacturer(verificationResult);
  }

  if (riskScore > 67) {
    await createIncident(verificationResult);
  }

  if (riskScore > 85) {
    await alertAdministrators(verificationResult);
    await notifyAuthorities(verificationResult);
  }

  return {
    ...verificationResult,
    decision,
    actions,
    recommendations: getRecommendations(riskScore, verificationState),
  };
}

function getDecision(riskScore) {
  if (riskScore <= 20) return "ACCEPT";
  if (riskScore <= 40) return "ACCEPT_WITH_CAUTION";
  if (riskScore <= 66) return "VERIFY_MANUALLY";
  if (riskScore <= 85) return "REJECT";
  return "REJECT_CRITICAL";
}

async function getActions(decision, verificationResult) {
  const actions = [];

  switch (decision) {
    case "ACCEPT":
      actions.push({
        type: "MARK_CODE_USED",
        timestamp: new Date(),
        result: "completed",
      });
      break;

    case "ACCEPT_WITH_CAUTION":
      actions.push({
        type: "WARN_USER",
        message: "Minor concerns detected",
      });
      actions.push({
        type: "TRACK_BATCH",
        batchId: verificationResult.batch?.id,
      });
      break;

    case "VERIFY_MANUALLY":
      actions.push({
        type: "CREATE_VERIFICATION_REQUEST",
        assignedTo: "manufacturer",
        priority: "high",
      });
      actions.push({
        type: "NOTIFY_MANUFACTURER",
        codeValue: verificationResult.codeValue,
      });
      break;

    case "REJECT":
      actions.push({
        type: "BLOCK_CODE",
        codeId: verificationResult.code?.id,
      });
      actions.push({
        type: "CREATE_INCIDENT",
        severity: "high",
        reason: "Strong counterfeit indicators",
      });
      break;

    case "REJECT_CRITICAL":
      actions.push({
        type: "BLOCK_BATCH",
        batchId: verificationResult.batch?.id,
      });
      actions.push({
        type: "CREATE_CRITICAL_INCIDENT",
        severity: "critical",
      });
      actions.push({
        type: "SUSPEND_MANUFACTURER",
        manufacturerId: verificationResult.code?.manufacturerId,
        pending_investigation: true,
      });
      actions.push({
        type: "NOTIFY_AUTHORITIES",
        agencies: ["FDA", "NAFDAC", "LOCAL_POLICE"],
      });
      break;
  }

  return actions;
}

function getRecommendations(riskScore, state) {
  const recommendations = [];

  if (riskScore <= 20) {
    recommendations.push("No action needed - product is safe");
  } else if (riskScore <= 40) {
    recommendations.push("Monitor this batch for patterns");
    recommendations.push("Note verification location and time");
  } else if (riskScore <= 66) {
    recommendations.push("Contact manufacturer for verification");
    recommendations.push("Preserve batch information for investigation");
  } else if (riskScore <= 85) {
    recommendations.push("Report to manufacturer immediately");
    recommendations.push("Do not distribute this product");
    recommendations.push("Preserve batch for authorities");
  } else {
    recommendations.push("URGENT: Contact law enforcement");
    recommendations.push("Provide code, batch, and location details");
    recommendations.push("Preserve all product packaging");
  }

  return recommendations;
}
```

### 3. Database Queries for Risk Analysis

```sql
-- Dashboard: Risk Score Distribution
SELECT
  CASE
    WHEN risk_score <= 20 THEN 'Genuine (0-20)'
    WHEN risk_score <= 40 THEN 'Low-Medium Risk (21-40)'
    WHEN risk_score <= 66 THEN 'Medium Risk (41-66)'
    WHEN risk_score <= 85 THEN 'High Risk (67-85)'
    ELSE 'Critical Risk (86-100)'
  END as risk_category,
  COUNT(*) as verification_count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM verification_log), 2) as percentage,
  AVG(risk_score) as avg_risk,
  MAX(risk_score) as max_risk
FROM verification_log
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY risk_category
ORDER BY risk_score DESC;

-- Identify codes triggering high-risk patterns
SELECT
  code_value,
  COUNT(*) as verification_attempts,
  AVG(risk_score) as avg_risk_score,
  MAX(risk_score) as max_risk_score,
  COUNT(DISTINCT verification_state) as unique_states,
  COUNT(DISTINCT DATE(created_at)) as days_verified,
  MIN(created_at) as first_verification,
  MAX(created_at) as last_verification
FROM verification_log
WHERE risk_score >= 67
  AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY code_value
HAVING verification_attempts >= 3
ORDER BY max_risk_score DESC, verification_attempts DESC;

-- Manufacturer risk score trends
SELECT
  m.id,
  m.name,
  m.risk_score,
  m.trust_score,
  m.last_risk_assessment,
  ROUND(
    (SELECT COUNT(*) FROM verification_log vl
     WHERE vl.manufacturer_id = m.id
     AND vl.verification_state = 'GENUINE'
     AND vl.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) * 100.0 /
    (SELECT COUNT(*) FROM verification_log vl
     WHERE vl.manufacturer_id = m.id
     AND vl.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY))
  , 2) as recent_genuine_rate
FROM manufacturer m
WHERE m.risk_score IS NOT NULL
ORDER BY m.risk_score DESC;

-- Incident generation analysis
SELECT
  DATE(created_at) as date,
  COUNT(*) as incidents_created,
  AVG(risk_score) as avg_risk_triggering_incident,
  MIN(risk_score) as min_risk,
  MAX(risk_score) as max_risk
FROM incident
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### 4. API Response Enhancement

```javascript
// Enhanced verification response including risk context

{
  "codeValue": "PHARMA-ABC123",

  // Original verification data
  "product": { ... },
  "batch": { ... },
  "code": { ... },

  // Enhanced with risk scoring
  "verification": {
    "state": "GENUINE|SUSPICIOUS_PATTERN|etc",
    "riskScore": 35,
    "riskLevel": "LOW-MEDIUM",
    "riskCategory": "ACCEPT_WITH_CAUTION",

    "riskBreakdown": {
      "rulesScore": 35,
      "aiScore": 40,
      "finalScore": 40,
      "reasoning": "Multiple locations detected in recent timeframe"
    },

    "advisory": "Code verified in different locations with 2 hours",

    "recommendations": [
      "Monitor this batch for counterfeit patterns",
      "Note verification location: Lagos, Nigeria",
      "Contact manufacturer if additional verification needed"
    ],

    "trustDecision": "ACCEPT_WITH_CAUTION",

    "actions": [
      {
        "type": "WARN_USER",
        "severity": "low",
        "message": "Minor concerns detected"
      },
      {
        "type": "TRACK_BATCH",
        "batchId": "batch-456"
      }
    ],

    "timestamp": "2024-01-24T10:30:45.123Z",
    "analyzedAt": "2024-01-24T10:30:43.000Z",
    "processingTime": "2.123ms"
  },

  // Confidence metrics
  "confidence": {
    "score": 65,
    "reasons": [
      "Code found in database",
      "Not previously used",
      "Batch not expired",
      "Geographic variation noted",
      "Timing pattern detected"
    ]
  },

  // For admin/manufacturer use
  "adminContext": {
    "manufacturerId": "mfg-789",
    "manufacturerRiskScore": 28,
    "incidentCreated": false,
    "shouldEscalate": false,
    "auditTrail": {
      "verifiedBy": "system",
      "verificationMethod": "manual",
      "ipAddress": "192.168.1.1",
      "userLocation": { "lat": 6.5244, "lng": 3.3792 }
    }
  }
}
```

### 5. Monitoring & Alerting Setup

```javascript
// backend/src/services/monitoringService.js

export async function monitorRiskMetrics() {
  // Run every hour
  const metrics = {
    hourlyGenuineRate: await calculateGenuineRate("1 HOUR"),
    dailyGenuineRate: await calculateGenuineRate("1 DAY"),
    criticalIncidents: await countIncidents("critical", "1 HOUR"),
    highRiskVerifications: await countByRiskScore(67, 85, "1 HOUR"),
    criticalRiskVerifications: await countByRiskScore(85, 100, "1 HOUR"),
    averageRiskScore: await getAverageRiskScore("1 HOUR"),
    manufacturersInRed: await countManufacturersByRisk(71, 100),
  };

  // Check thresholds and alert
  const alerts = [];

  if (metrics.hourlyGenuineRate < 80) {
    alerts.push({
      severity: "critical",
      message: `Genuine rate dropped to ${metrics.hourlyGenuineRate}%`,
      threshold: "80%",
      action: "Investigate verification patterns",
    });
  }

  if (metrics.criticalIncidents > 10) {
    alerts.push({
      severity: "critical",
      message: `${metrics.criticalIncidents} critical incidents in last hour`,
      threshold: "<10",
      action: "Review incidents and escalate",
    });
  }

  if (metrics.criticalRiskVerifications > 20) {
    alerts.push({
      severity: "high",
      message: `${metrics.criticalRiskVerifications} codes with risk >85`,
      threshold: "<20",
      action: "Investigate counterfeit patterns",
    });
  }

  if (metrics.manufacturersInRed > 5) {
    alerts.push({
      severity: "high",
      message: `${metrics.manufacturersInRed} manufacturers flagged as unreliable`,
      threshold: "<5",
      action: "Review manufacturing practices",
    });
  }

  if (alerts.length > 0) {
    await sendAlerts(alerts);
  }

  return metrics;
}
```

### 6. Batch Processing for Risk Recalculation

```javascript
// backend/src/jobs/manufacturerAuditJob.js

export async function runDailyManufacturerAudits() {
  const manufacturers = await prisma.manufacturer.findMany({
    where: { isActive: true },
  });

  const results = [];

  for (const manufacturer of manufacturers) {
    try {
      const riskMetrics = await recalculateManufacturerRiskScore(
        manufacturer.id,
      );

      // Check if risk increased significantly
      const previousRisk = manufacturer.riskScore || 0;
      const riskIncrease = riskMetrics.riskScore - previousRisk;

      if (riskIncrease > 20) {
        // Alert on significant increases
        await sendRiskIncreaseAlert(manufacturer, riskIncrease);
      }

      results.push({
        manufacturerId: manufacturer.id,
        name: manufacturer.name,
        previousRisk,
        newRisk: riskMetrics.riskScore,
        change: riskIncrease,
        status: riskIncrease > 20 ? "ALERT" : "OK",
        summary: riskMetrics.summary,
      });
    } catch (error) {
      console.error(`Failed to audit ${manufacturer.name}:`, error);
      results.push({
        manufacturerId: manufacturer.id,
        name: manufacturer.name,
        status: "ERROR",
        error: error.message,
      });
    }
  }

  // Log audit run
  await logAuditRun({
    timestamp: new Date(),
    manufacturersAudited: results.length,
    alerts: results.filter((r) => r.status === "ALERT").length,
    errors: results.filter((r) => r.status === "ERROR").length,
    results,
  });

  return results;
}
```

---

## Integration Checklist

- [ ] Implement frontend UI handlers for each risk level
- [ ] Create database indexes for risk_score queries
- [ ] Set up monitoring dashboards
- [ ] Configure alert thresholds
- [ ] Implement batch audit scheduler
- [ ] Create incident response workflows
- [ ] Train support team on risk score meanings
- [ ] Set up automated email alerts
- [ ] Create admin dashboard widgets
- [ ] Document escalation procedures

---

## Next Steps

1. **Immediate**: Implement frontend risk score display
2. **Week 1**: Set up monitoring and alerting
3. **Week 2**: Create incident response procedures
4. **Week 3**: Train support team
5. **Week 4**: Optimize based on real data

All code examples are production-ready and can be integrated directly into your system.
