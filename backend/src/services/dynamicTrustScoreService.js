import prisma from "../models/prismaClient.js";

/**
 * Calculate dynamic trust score for a manufacturer
 * Based on multiple factors: verification success, payment history, compliance, team activity
 * Range: 0-100 (100 = completely trustworthy)
 */
export async function calculateDynamicTrustScore(manufacturerId) {
  try {
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      include: {
        products: {
          include: {
            batches: {
              include: {
                codes: true,
              },
            },
          },
        },
        teamMembers: true,
      },
    });

    if (!manufacturer) throw new Error("Manufacturer not found");

    // Get verification logs
    const allVerifications = await prisma.verificationLog.findMany({
      where: {
        code: {
          batch: {
            product: {
              manufacturerId,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Component 1: Verification Success Rate (40% weight)
    let verificationScore = 100;
    if (allVerifications.length > 0) {
      const genuineCount = allVerifications.filter(
        (l) => l.verificationState === "GENUINE",
      ).length;
      const genuineRate = (genuineCount / allVerifications.length) * 100;

      // >95% genuine = 100 points
      // 80-95% = scale down
      // <80% = significant penalty
      if (genuineRate < 70) {
        verificationScore = 30;
      } else if (genuineRate < 80) {
        verificationScore = 50;
      } else if (genuineRate < 90) {
        verificationScore = 75;
      } else if (genuineRate < 95) {
        verificationScore = 90;
      }
      // else 95%+ = 100
    } else {
      verificationScore = 60; // Neutral for new manufacturers
    }

    // Component 2: Payment History (25% weight)
    let paymentScore = 100;
    const payments = await prisma.payment.findMany({
      where: {
        manufacturerId,
      },
      orderBy: { createdAt: "desc" },
      take: 12, // Last 12 payments
    });

    if (payments.length > 0) {
      const failedPayments = payments.filter(
        (p) => p.status === "failed" || p.status === "pending",
      ).length;
      const failureRate = (failedPayments / payments.length) * 100;

      if (failureRate > 20) {
        paymentScore = 40;
      } else if (failureRate > 10) {
        paymentScore = 70;
      } else if (failureRate > 0) {
        paymentScore = 90;
      }
      // else 0 failures = 100
    } else {
      paymentScore = 60; // Neutral for new manufacturers
    }

    // Component 3: Compliance Score (20% weight)
    let complianceScore = 100;

    // Check if documents are verified
    if (!manufacturer.nafdacLicenseVerified) {
      complianceScore -= 20;
    }
    if (!manufacturer.businessCertificateVerified) {
      complianceScore -= 20;
    }
    if (!manufacturer.websiteVerified) {
      complianceScore -= 10;
    }

    // Check for overdue documents
    const docUpdateDaysAgo =
      (Date.now() - new Date(manufacturer.updatedAt)) / (1000 * 60 * 60 * 24);
    if (docUpdateDaysAgo > 180) {
      complianceScore -= 15; // Stale documentation
    }

    complianceScore = Math.max(complianceScore, 0);

    // Component 4: Team Activity (15% weight)
    let teamActivityScore = 100;
    const daysSinceLastActivity =
      (Date.now() -
        new Date(manufacturer.lastActivityAt || manufacturer.createdAt)) /
      (1000 * 60 * 60 * 24);

    if (daysSinceLastActivity > 90) {
      teamActivityScore = 40; // Inactive for >3 months
    } else if (daysSinceLastActivity > 30) {
      teamActivityScore = 70; // Inactive for >1 month
    } else if (daysSinceLastActivity > 7) {
      teamActivityScore = 90; // Inactive for >1 week
    }
    // else active = 100

    // Component 5: Batch Management Quality (10% weight)
    let batchQualityScore = 100;
    let expiredBatchCount = 0;
    const totalBatches = manufacturer.products.reduce(
      (sum, p) => sum + p.batches.length,
      0,
    );

    if (totalBatches > 0) {
      for (const product of manufacturer.products) {
        for (const batch of product.batches) {
          if (new Date(batch.expirationDate) < new Date()) {
            expiredBatchCount++;
          }
        }
      }

      const expiredRate = (expiredBatchCount / totalBatches) * 100;
      if (expiredRate > 20) {
        batchQualityScore = 40;
      } else if (expiredRate > 10) {
        batchQualityScore = 70;
      } else if (expiredRate > 0) {
        batchQualityScore = 90;
      }
    }

    // Weighted calculation
    const trustScore =
      verificationScore * 0.4 +
      paymentScore * 0.25 +
      complianceScore * 0.2 +
      teamActivityScore * 0.1 +
      batchQualityScore * 0.05;

    // Apply penalties for risk factors
    let finalTrustScore = Math.round(trustScore);

    // Heavy penalty if manufacturer has been flagged for suspicious activity
    const recentSuspiciousLogs = allVerifications.filter(
      (l) =>
        l.verificationState === "SUSPICIOUS_PATTERN" &&
        new Date(l.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    ).length;

    if (recentSuspiciousLogs > 5) {
      finalTrustScore = Math.max(finalTrustScore - 30, 0);
    }

    // Cap at 100
    finalTrustScore = Math.min(finalTrustScore, 100);

    // Save to database
    await prisma.manufacturer.update({
      where: { id: manufacturerId },
      data: {
        trustScore: finalTrustScore,
        lastTrustAssessment: new Date(),
      },
    });

    return {
      trustScore: finalTrustScore,
      components: {
        verification: verificationScore,
        payment: paymentScore,
        compliance: complianceScore,
        teamActivity: teamActivityScore,
        batchQuality: batchQualityScore,
      },
      breakdown: {
        genuineVerificationRate:
          allVerifications.length > 0
            ? (
                (allVerifications.filter(
                  (l) => l.verificationState === "GENUINE",
                ).length /
                  allVerifications.length) *
                100
              ).toFixed(1)
            : "N/A",
        totalVerifications: allVerifications.length,
        paymentHistory: payments.length,
        expiredBatches: expiredBatchCount,
        daysSinceActivity: Math.round(daysSinceLastActivity),
      },
    };
  } catch (err) {
    console.error(
      "[TRUST_SCORE] Error calculating dynamic trust score:",
      err.message,
    );
    throw err;
  }
}

/**
 * Update trust score history for trend analysis
 */
export async function trackTrustScoreHistory(manufacturerId) {
  try {
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
    });

    if (!manufacturer || !manufacturer.trustScore) return;

    // Create history record
    await prisma.trustScoreHistory.create({
      data: {
        manufacturerId,
        score: manufacturer.trustScore,
        recordedAt: new Date(),
      },
    });

    console.log(
      `[TRUST_HISTORY] Recorded score ${manufacturer.trustScore} for ${manufacturerId}`,
    );
  } catch (err) {
    console.error("[TRUST_HISTORY] Error tracking trust score:", err.message);
  }
}

/**
 * Get trust score trend for last 90 days
 */
export async function getTrustScoreTrend(manufacturerId, days = 90) {
  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const history = await prisma.trustScoreHistory.findMany({
      where: {
        manufacturerId,
        recordedAt: {
          gte: startDate,
        },
      },
      orderBy: { recordedAt: "asc" },
    });

    if (history.length === 0) {
      return {
        trend: "NO_DATA",
        averageScore: null,
        lowestScore: null,
        highestScore: null,
        history: [],
      };
    }

    const scores = history.map((h) => h.score);
    const averageScore = Math.round(
      scores.reduce((a, b) => a + b, 0) / scores.length,
    );
    const lowestScore = Math.min(...scores);
    const highestScore = Math.max(...scores);

    // Determine trend
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    let trend = "STABLE";
    if (secondAvg > firstAvg + 5) {
      trend = "IMPROVING";
    } else if (secondAvg < firstAvg - 5) {
      trend = "DECLINING";
    }

    return {
      trend,
      averageScore,
      lowestScore,
      highestScore,
      history: history.map((h) => ({
        date: h.recordedAt,
        score: h.score,
      })),
    };
  } catch (err) {
    console.error(
      "[TRUST_TREND] Error getting trust score trend:",
      err.message,
    );
    throw err;
  }
}

/**
 * Recalculate trust scores for all manufacturers
 * Should be run as a scheduled job (daily)
 */
export async function recalculateAllTrustScores() {
  try {
    const manufacturers = await prisma.manufacturer.findMany();
    const results = [];

    for (const manufacturer of manufacturers) {
      const trustData = await calculateDynamicTrustScore(manufacturer.id);
      await trackTrustScoreHistory(manufacturer.id);

      results.push({
        manufacturerId: manufacturer.id,
        trustScore: trustData.trustScore,
      });
    }

    console.log(
      `[TRUST_BATCH] Recalculated trust scores for ${results.length} manufacturers`,
    );
    return results;
  } catch (err) {
    console.error("[TRUST_BATCH] Error in batch recalculation:", err.message);
    throw err;
  }
}
