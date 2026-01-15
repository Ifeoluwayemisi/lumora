import prisma from "../models/prismaClient.js";
import {
  createProduct,
  createBatchWithCodes,
} from "../services/manufacturerService.js";
import { parseISO, isValid } from "date-fns";

/**
 * Get manufacturer dashboard overview
 * Returns: stats, quota, recent alerts, plan info
 */
export async function getDashboard(req, res) {
  try {
    const manufacturerId = req.user.id;

    // Get manufacturer info
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      select: {
        id: true,
        name: true,
        email: true,
        verified: true,
        accountStatus: true,
        trustScore: true,
        riskLevel: true,
        plan: true,
      },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    // Get product count
    const totalProducts = await prisma.product.count({
      where: { manufacturerId },
    });

    // Get total codes generated
    const totalCodes = await prisma.code.count({
      where: { manufacturerId },
    });

    // Get verification count
    const totalVerifications = await prisma.verificationLog.count({
      where: { manufacturerId },
    });

    // Get suspicious/flagged verifications
    const suspiciousAttempts = await prisma.verificationLog.count({
      where: {
        manufacturerId,
        verificationState: {
          in: ["SUSPICIOUS_PATTERN", "CODE_ALREADY_USED"],
        },
      },
    });

    // Get daily quota (reset at midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const codesGeneratedToday = await prisma.code.count({
      where: {
        manufacturerId,
        createdAt: { gte: today },
      },
    });

    // Determine daily limit based on plan
    const dailyLimit = manufacturer.plan === "PREMIUM" ? 1000 : 50;
    const quotaRemaining = Math.max(dailyLimit - codesGeneratedToday, 0);

    // Get recent alerts (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const recentAlerts = await prisma.verificationLog.findMany({
      where: {
        manufacturerId,
        createdAt: { gte: thirtyDaysAgo },
        verificationState: { in: ["SUSPICIOUS_PATTERN", "CODE_ALREADY_USED"] },
      },
      select: {
        id: true,
        code: true,
        verificationState: true,
        latitude: true,
        longitude: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Format alerts for frontend
    const formattedAlerts = recentAlerts.map((alert) => ({
      id: alert.id,
      title:
        alert.verificationState === "SUSPICIOUS_PATTERN"
          ? "Suspicious Pattern Detected"
          : "Code Reuse Attempt",
      message:
        alert.verificationState === "SUSPICIOUS_PATTERN"
          ? `Multiple rapid verifications of code ${alert.code?.substring(0, 8)}...`
          : `Code ${alert.code?.substring(0, 8)}... was already verified`,
      severity:
        alert.verificationState === "SUSPICIOUS_PATTERN" ? "high" : "medium",
      timestamp: alert.createdAt,
    }));

    return res.status(200).json({
      manufacturer,
      stats: {
        totalProducts,
        totalCodes,
        totalVerifications,
        suspiciousAttempts,
      },
      quota: {
        used: codesGeneratedToday,
        limit: dailyLimit,
        remaining: quotaRemaining,
      },
      recentAlerts: formattedAlerts,
      plan: {
        name: manufacturer.plan === "PREMIUM" ? "Premium" : "Basic",
        type: manufacturer.plan?.toLowerCase() || "basic",
        dailyCodeLimit: dailyLimit,
      },
    });
  } catch (err) {
    console.error("[GET_DASHBOARD] Error:", err.message);
    return res.status(500).json({
      error: "Failed to fetch dashboard",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Please try again later",
    });
  }
}

/**
 * Add product - Only for verified manufacturers
 */
export async function addProduct(req, res) {
  try {
    const { name, description } = req.body;

    // Input validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "Product name is required" });
    }

    // Check manufacturer is verified
    if (!req.user.verified) {
      return res.status(403).json({
        error: "Unauthorized",
        message: "Your account must be verified by NAFDAC to add products",
      });
    }

    const product = await createProduct({
      manufacturerId: req.user.id,
      name: name.trim(),
      description: description?.trim() || "",
    });

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (err) {
    console.error("[ADD_PRODUCT] Error:", err.message);
    return res.status(500).json({
      error: "Failed to create product",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Please try again later",
    });
  }
}

/**
 * Add batch with codes - Only for verified manufacturers
 */
export async function addBatch(req, res) {
  try {
    const { productId, productionDate, expiryDate, quantity } = req.body;

    // Input validation
    if (!productId || !expiryDate) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["productId", "expiryDate"],
      });
    }

    if (!quantity || isNaN(quantity) || quantity < 1 || quantity > 10000) {
      return res.status(400).json({
        error: "Quantity must be between 1 and 10000",
      });
    }

    // Check manufacturer is verified
    if (!req.user.verified) {
      return res.status(403).json({
        error: "Unauthorized",
        message: "Your account must be verified by NAFDAC to create batches",
      });
    }

    // Validate dates
    const prodDate = productionDate ? parseISO(productionDate) : new Date();
    const expDate = parseISO(expiryDate);

    if (!isValid(expDate)) {
      return res.status(400).json({
        error: "Invalid expiration date format",
      });
    }

    if (expDate <= new Date()) {
      return res.status(400).json({
        error: "Expiration date must be in the future",
      });
    }

    const { batch, createdCodes } = await createBatchWithCodes({
      productId,
      manufacturerId: req.user.id,
      productionDate: prodDate,
      expirationDate: expDate,
      quantity,
    });

    return res.status(201).json({
      message: "Batch created successfully",
      batch,
      generatedCodes: createdCodes.length,
    });
  } catch (err) {
    console.error("[ADD_BATCH] Error:", err.message);

    // Handle specific errors
    if (err.message?.includes("Daily code limit")) {
      return res.status(429).json({
        error: "Rate limited",
        message:
          "Daily code generation limit reached. Upgrade to PREMIUM plan to generate more codes.",
      });
    }

    if (err.code === "P2025") {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    return res.status(500).json({
      error: "Failed to create batch",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Please try again later",
    });
  }
}

/**
 * Get manufacturer verification history
 */
export async function getManufacturerHistory(req, res) {
  try {
    const { productId, batchId, from, to, page = 1, limit = 20 } = req.query;

    // Input validation
    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.min(Math.max(Number(limit), 1), 100); // Clamp between 1-100
    const skip = (pageNum - 1) * limitNum;

    const where = {
      manufacturerId: req.user.id,
    };

    if (productId) where.productId = productId;
    if (batchId) where.batchId = batchId;

    if (from || to) {
      where.createdAt = {};
      if (from && isValid(parseISO(from))) {
        where.createdAt.gte = parseISO(from);
      }
      if (to && isValid(parseISO(to))) {
        where.createdAt.lte = parseISO(to);
      }
    }

    const [history, total] = await Promise.all([
      prisma.verificationLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.verificationLog.count({ where }),
    ]);

    return res.status(200).json({
      data: history,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("[GET_HISTORY] Error:", err.message);
    return res.status(500).json({
      error: "Failed to fetch history",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Please try again later",
    });
  }
}
