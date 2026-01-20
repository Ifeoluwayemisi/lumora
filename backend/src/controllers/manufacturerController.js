import prisma from "../models/prismaClient.js";
import {
  createProduct,
  createBatchWithCodes,
} from "../services/manufacturerService.js";
import { canCreateCode, getQuotaInfo } from "../services/quotaService.js";
import { parseISO, isValid } from "date-fns";
import { generateBatchPDF, generateBatchCSV } from "../utils/pdfGenerator.js";

/**
 * Get manufacturer profile
 */
export async function getProfile(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: {
        id: true,
        name: true,
        email: true,
        verified: true,
        accountStatus: true,
      },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    res.status(200).json({ manufacturer });
  } catch (err) {
    console.error("[GET_PROFILE] Error:", err.message);
    res.status(500).json({ error: "Failed to get profile" });
  }
}

/**
 * Get manufacturer dashboard overview
 * Returns: stats, quota, recent alerts, plan info
 */
export async function getDashboard(req, res) {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();

  try {
    console.log(
      `[DASHBOARD-${requestId}] Request started at ${new Date().toISOString()}`,
    );

    const userId = req.user?.id;
    console.log(`[DASHBOARD-${requestId}] User ID: ${userId}`);

    if (!userId) {
      console.warn(
        `[DASHBOARD-${requestId}] Unauthorized: No user ID in request`,
      );
      return res.status(401).json({
        error: "Unauthorized",
        message: "User not found in request",
      });
    }

    // Get manufacturer info (using only fields that exist in current schema)
    let manufacturer = null;
    try {
      console.log(`[DASHBOARD-${requestId}] Fetching manufacturer record...`);
      const manufacturerData = await prisma.manufacturer.findUnique({
        where: { userId },
      });

      if (!manufacturerData) {
        console.warn(
          `[DASHBOARD-${requestId}] Manufacturer not found in database`,
        );
        return res.status(404).json({
          error: "Manufacturer not found",
          message:
            "No manufacturer record found. Please complete manufacturer registration.",
        });
      }

      console.log(
        `[DASHBOARD-${requestId}] Manufacturer found: ${manufacturerData.name}`,
      );

      // Build response with defaults for fields that may not exist yet
      manufacturer = {
        id: manufacturerData?.id,
        name: manufacturerData?.name,
        email: manufacturerData?.email || "", // Will be populated once migration runs
        verified: manufacturerData?.verified || false,
        accountStatus:
          manufacturerData?.accountStatus || "pending_verification",
        trustScore: manufacturerData?.trustScore ?? 0,
        riskLevel: manufacturerData?.riskLevel || "MEDIUM",
        plan: manufacturerData?.plan || "BASIC",
      };
    } catch (dbErr) {
      console.error(
        `[DASHBOARD-${requestId}] Database error during manufacturer fetch:`,
        {
          code: dbErr.code,
          message: dbErr.message,
          stack: dbErr.stack,
        },
      );
      throw dbErr;
    }
    // Get product count
    const totalProducts = await prisma.product.count({
      where: { manufacturerId: manufacturer.id },
    });
    console.log(`[DASHBOARD-${requestId}] Total products: ${totalProducts}`);

    // Get total codes generated
    const totalCodes = await prisma.code.count({
      where: { manufacturerId: manufacturer.id },
    });
    console.log(`[DASHBOARD-${requestId}] Total codes: ${totalCodes}`);

    // Get total batches
    const totalBatches = await prisma.batch.count({
      where: { manufacturerId: manufacturer.id },
    });
    console.log(`[DASHBOARD-${requestId}] Total batches: ${totalBatches}`);

    // Get verification count
    const totalVerifications = await prisma.verificationLog.count({
      where: { manufacturerId: manufacturer.id },
    });
    console.log(
      `[DASHBOARD-${requestId}] Total verifications: ${totalVerifications}`,
    );

    // Get suspicious/flagged verifications
    const suspiciousAttempts = await prisma.verificationLog.count({
      where: {
        manufacturerId: manufacturer.id,
        verificationState: {
          in: ["SUSPICIOUS_PATTERN", "CODE_ALREADY_USED"],
        },
      },
    });
    console.log(
      `[DASHBOARD-${requestId}] Suspicious attempts: ${suspiciousAttempts}`,
    );

    // Get daily quota (reset at midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const codesGeneratedToday = await prisma.code.count({
      where: {
        manufacturerId: manufacturer.id,
        createdAt: { gte: today },
      },
    });
    console.log(
      `[DASHBOARD-${requestId}] Codes generated today: ${codesGeneratedToday}`,
    );

    // Determine daily limit based on plan
    const dailyLimit = manufacturer.plan === "PREMIUM" ? 1000 : 50;
    const quotaRemaining = Math.max(dailyLimit - codesGeneratedToday, 0);

    // Get recent alerts (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    console.log(`[DASHBOARD-${requestId}] Fetching recent alerts...`);
    const recentAlerts = await prisma.verificationLog.findMany({
      where: {
        manufacturerId: manufacturer.id,
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
    console.log(
      `[DASHBOARD-${requestId}] Recent alerts found: ${recentAlerts.length}`,
    );

    // Check for expiring batches (within 7 days)
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const expiringBatches = await prisma.batch.findMany({
      where: {
        manufacturerId: manufacturer.id,
        expirationDate: {
          gte: now,
          lte: weekFromNow,
        },
      },
      select: {
        id: true,
        batchNumber: true,
        expirationDate: true,
        product: { select: { name: true } },
      },
      take: 5, // Limit to 5 expiring batches
    });

    console.log(
      `[DASHBOARD-${requestId}] Expiring batches found: ${expiringBatches.length}`,
    );

    // Helper function to safely get code prefix
    const getCodePrefix = (code) => {
      if (!code) return "[unknown]";
      const codeStr = typeof code === "string" ? code : String(code);
      return codeStr.substring(0, 8) || "[unknown]";
    };

    // Format alerts for frontend
    let formattedAlerts = recentAlerts.map((alert) => {
      const codePrefix = getCodePrefix(alert.code);
      return {
        id: alert.id,
        title:
          alert.verificationState === "SUSPICIOUS_PATTERN"
            ? "Suspicious Pattern Detected"
            : "Code Reuse Attempt",
        message:
          alert.verificationState === "SUSPICIOUS_PATTERN"
            ? `Multiple rapid verifications of code ${codePrefix}...`
            : `Code ${codePrefix}... was already verified`,
        severity:
          alert.verificationState === "SUSPICIOUS_PATTERN" ? "high" : "medium",
        timestamp: alert.createdAt,
      };
    });

    // Add batch expiration alerts
    const expirationAlerts = expiringBatches.map((batch) => {
      const daysUntilExpiry = Math.ceil(
        (batch.expirationDate - now) / (1000 * 60 * 60 * 24),
      );
      return {
        id: `batch-expiring-${batch.id}`,
        title: "Batch Expiring Soon",
        message: `${batch.product?.name || "Batch"} ${batch.batchNumber} expires in ${daysUntilExpiry} days`,
        severity: daysUntilExpiry <= 3 ? "high" : "medium",
        timestamp: new Date(),
      };
    });

    // Combine all alerts (verification + expiration), sorted by severity
    formattedAlerts = [...formattedAlerts, ...expirationAlerts].sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    const duration = Date.now() - startTime;
    console.log(
      `[DASHBOARD-${requestId}] Request completed successfully in ${duration}ms`,
    );

    return res.status(200).json({
      manufacturer,
      stats: {
        totalProducts,
        totalCodes,
        totalBatches,
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
    const duration = Date.now() - startTime;
    console.error(`[DASHBOARD-${requestId}] Error after ${duration}ms:`, {
      message: err.message,
      code: err.code,
      meta: err.meta,
      stack: err.stack,
      manufacturerId: req.user?.id,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      error: "Failed to fetch dashboard",
      message:
        process.env.NODE_ENV === "development"
          ? `${err.message}${err.code ? ` (${err.code})` : ""}`
          : "Please try again later",
      details:
        process.env.NODE_ENV === "development"
          ? {
              code: err.code,
              meta: err.meta,
              message: err.message,
            }
          : undefined,
      requestId, // Help with debugging in production
    });
  }
}

/**
 * Get all products for a manufacturer
 * With pagination and search support
 */
export async function getProducts(req, res) {
  try {
    const { page = 1, limit = 10, search, category } = req.query;
    const userId = req.user.id;

    // Look up manufacturer from user
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const manufacturerId = manufacturer.id;

    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where = { manufacturerId };
    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { description: { contains: search.trim(), mode: "insensitive" } },
      ];
    }
    if (category && category.trim()) {
      where.category = category.trim();
    }

    // Fetch products with batch and code count
    const products = await prisma.product.findMany({
      where,
      include: {
        batches: {
          select: { id: true },
        },
        codes: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNum,
    });

    // Get total count
    const total = await prisma.product.count({ where });

    // Transform response with counts
    const data = products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      skuPrefix: p.skuPrefix,
      batchCount: p.batches?.length || 0,
      codeCount: p.codes?.length || 0,
      createdAt: p.createdAt,
      canEdit: (p.codes?.length || 0) === 0, // Can edit if no codes generated
      canDelete: false, // Generally safer to not allow deletion
    }));

    return res.status(200).json({
      data,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("[GET_PRODUCTS] Error:", err.message);
    return res.status(500).json({
      error: "Failed to fetch products",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Please try again later",
    });
  }
}

/**
 * Get single product with detailed info
 */
export async function getProduct(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Look up manufacturer from user
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const manufacturerId = manufacturer.id;

    const product = await prisma.product.findFirst({
      where: { id, manufacturerId },
      include: {
        batches: {
          select: {
            id: true,
            quantity: true,
            expirationDate: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { codes: true },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json({
      ...product,
      codeCount: product._count.codes,
    });
  } catch (err) {
    console.error("[GET_PRODUCT] Error:", err.message);
    return res.status(500).json({
      error: "Failed to fetch product",
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
    const { name, description, category, skuPrefix } = req.body;
    const userId = req.user.id;

    // Look up manufacturer from user
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true, verified: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const manufacturerId = manufacturer.id;

    // Input validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "Product name is required" });
    }

    if (name.length > 255) {
      return res
        .status(400)
        .json({ error: "Product name must be less than 255 characters" });
    }

    if (description && description.length > 1000) {
      return res
        .status(400)
        .json({ error: "Description must be less than 1000 characters" });
    }

    // Check manufacturer is verified
    if (!manufacturer?.verified) {
      return res.status(403).json({
        error: "Unauthorized",
        message: "Your account must be verified by NAFDAC to add products",
      });
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        manufacturerId,
        name: name.trim(),
        description: description?.trim() || null,
        category: category?.trim() || null,
        skuPrefix: skuPrefix?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        skuPrefix: true,
        createdAt: true,
      },
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
 * Update product - Cannot edit if codes have been generated
 */
export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { name, description, category, skuPrefix } = req.body;
    const userId = req.user.id;

    // Look up manufacturer from user
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const manufacturerId = manufacturer.id;

    // Verify product exists and belongs to manufacturer
    const product = await prisma.product.findFirst({
      where: { id, manufacturerId },
      select: {
        id: true,
        _count: { select: { codes: true } },
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Business rule: Cannot edit if codes already generated
    if (product._count.codes > 0) {
      return res.status(400).json({
        error: "Cannot edit product",
        message:
          "This product cannot be edited because codes have already been generated. Create a new product instead.",
      });
    }

    // Validate input
    if (name && typeof name === "string") {
      if (name.trim().length === 0) {
        return res.status(400).json({ error: "Product name cannot be empty" });
      }
      if (name.length > 255) {
        return res
          .status(400)
          .json({ error: "Product name must be less than 255 characters" });
      }
    }

    if (description && description.length > 1000) {
      return res
        .status(400)
        .json({ error: "Description must be less than 1000 characters" });
    }

    // Update product
    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description && { description: description.trim() }),
        ...(category && { category: category.trim() }),
        ...(skuPrefix && { skuPrefix: skuPrefix.trim() }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        skuPrefix: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      message: "Product updated successfully",
      product: updated,
    });
  } catch (err) {
    console.error("[UPDATE_PRODUCT] Error:", err.message);
    return res.status(500).json({
      error: "Failed to update product",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Please try again later",
    });
  }
}

/**
 * Delete product - Cannot delete if codes or verifications exist
 */
export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Look up manufacturer from user
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const manufacturerId = manufacturer.id;

    // Verify product exists and belongs to manufacturer
    const product = await prisma.product.findFirst({
      where: { id, manufacturerId },
      select: {
        id: true,
        name: true,
        _count: {
          select: { codes: true, batches: true },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Business rules: Cannot delete if codes or batches exist
    if (product._count.codes > 0) {
      return res.status(400).json({
        error: "Cannot delete product",
        message: "This product has generated codes and cannot be deleted",
      });
    }

    if (product._count.batches > 0) {
      return res.status(400).json({
        error: "Cannot delete product",
        message: "This product has active batches and cannot be deleted",
      });
    }

    // Delete product
    await prisma.product.delete({ where: { id } });

    return res.status(200).json({
      message: `Product "${product.name}" deleted successfully`,
    });
  } catch (err) {
    console.error("[DELETE_PRODUCT] Error:", err.message);

    if (err.code === "P2025") {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(500).json({
      error: "Failed to delete product",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Please try again later",
    });
  }
}

/**
 * Add batch with codes - Only for verified manufacturers
 * Enforces daily quota limits based on plan
 */
export async function addBatch(req, res) {
  try {
    const { productId, productionDate, expiryDate, quantity } = req.body;
    const userId = req.user.id;

    // Look up manufacturer from user
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: {
        id: true,
        verified: true,
        plan: true,
      },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const manufacturerId = manufacturer.id;

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

    // Check if manufacturer is verified
    if (!manufacturer.verified) {
      return res.status(403).json({
        error: "Unauthorized",
        message: "Your account must be verified by NAFDAC to create batches",
      });
    }

    // Verify product exists and belongs to manufacturer
    const product = await prisma.product.findFirst({
      where: { id: productId, manufacturerId },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check quota enforcement
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

    if (codesGeneratedToday + quantity > dailyLimit) {
      const remaining = dailyLimit - codesGeneratedToday;
      return res.status(429).json({
        error: "Daily quota exceeded",
        message: `You can generate ${remaining} more codes today. Upgrade to PREMIUM plan for unlimited codes.`,
        quota: {
          limit: dailyLimit,
          used: codesGeneratedToday,
          remaining,
          requestedQuantity: quantity,
        },
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

    // Check quota before creating codes
    const quotaCheck = await canCreateCode(manufacturerId);
    if (!quotaCheck.canCreate) {
      return res.status(429).json({
        error: "Daily quota exceeded",
        message: `You have reached your daily limit of ${quotaCheck.limit} codes for the ${quotaCheck.plan} plan. Please upgrade to Premium for unlimited codes.`,
        quota: quotaCheck,
      });
    }

    // Check if creating this batch would exceed quota
    if (quotaCheck.remaining < quantity) {
      return res.status(429).json({
        error: "Insufficient quota for this batch",
        message: `You can only create ${quotaCheck.remaining} more codes today. Your ${quotaCheck.plan} plan allows ${quotaCheck.limit} codes/day.`,
        quota: quotaCheck,
      });
    }

    // Create batch and codes
    const { batch, createdCodes } = await createBatchWithCodes({
      productId,
      manufacturerId,
      productionDate: prodDate,
      expirationDate: expDate,
      quantity,
    });

    return res.status(201).json({
      message: "Batch created successfully",
      batch,
      codesGenerated: createdCodes.length,
      quota: {
        limit: dailyLimit,
        used: codesGeneratedToday + quantity,
        remaining: dailyLimit - (codesGeneratedToday + quantity),
      },
    });
  } catch (err) {
    console.error("[ADD_BATCH] Error:", err.message);

    // Handle specific errors
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
 * Get manufacturer's batches
 * Returns: list of batches with code counts, pagination support
 */
export async function getBatches(req, res) {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, productId } = req.query;

    // Look up manufacturer from user
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const manufacturerId = manufacturer.id;

    // Input validation
    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.min(Math.max(Number(limit), 1), 100); // Clamp between 1-100
    const skip = (pageNum - 1) * limitNum;

    const where = { manufacturerId };
    if (productId) {
      where.productId = productId;
    }

    const [batches, total] = await Promise.all([
      prisma.batch.findMany({
        where,
        include: {
          _count: {
            select: { codes: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.batch.count({ where }),
    ]);

    // Format batches for frontend
    const formattedBatches = batches.map((batch) => ({
      id: batch.id,
      productId: batch.productId,
      quantity: batch._count.codes,
      productionDate: batch.productionDate,
      expirationDate: batch.expirationDate,
      createdAt: batch.createdAt,
      updatedAt: batch.updatedAt,
    }));

    return res.status(200).json({
      data: formattedBatches,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("[GET_BATCHES] Error:", err.message);
    return res.status(500).json({
      error: "Failed to fetch batches",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Please try again later",
    });
  }
}

/**
 * Get batch detail with all codes
 * Returns: batch info, product details, all associated codes
 */
export async function getBatchDetail(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Look up manufacturer from user
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const manufacturerId = manufacturer.id;

    // Get batch with codes and product info
    const batch = await prisma.batch.findFirst({
      where: {
        id,
        manufacturerId, // Ensure ownership
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: true,
            skuPrefix: true,
          },
        },
        codes: {
          select: {
            id: true,
            codeValue: true,
            isUsed: true,
            qrImagePath: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: { codes: true },
        },
      },
    });

    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    return res.status(200).json({
      batch: {
        id: batch.id,
        productId: batch.productId,
        product: batch.product,
        quantity: batch._count.codes,
        productionDate: batch.productionDate,
        expirationDate: batch.expirationDate,
        createdAt: batch.createdAt,
        codes: batch.codes, // Return all codes in batch
      },
    });
  } catch (err) {
    console.error("[GET_BATCH_DETAIL] Error:", err.message);
    return res.status(500).json({
      error: "Failed to fetch batch detail",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Please try again later",
    });
  }
}

/**
 * Download batch codes as CSV
 * Returns: CSV file with all codes in batch
 */
export async function downloadBatchCodes(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Look up manufacturer from user
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const manufacturerId = manufacturer.id;

    // Get batch with codes
    const batch = await prisma.batch.findFirst({
      where: {
        id,
        manufacturerId, // Ensure ownership
      },
      include: {
        product: {
          select: {
            name: true,
            category: true,
          },
        },
        codes: {
          select: {
            codeValue: true,
            isUsed: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    // Generate CSV content
    let csvContent =
      "Code,Status,Created Date,Product,Batch ID,Expiration Date\n";

    batch.codes.forEach((code) => {
      const createdDate = new Date(code.createdAt).toLocaleDateString();
      const expirationDate = new Date(
        batch.expirationDate,
      ).toLocaleDateString();
      const status = code.isUsed ? "USED" : "UNUSED";
      csvContent += `"${code.codeValue}","${status}","${createdDate}","${batch.product.name}","${id}","${expirationDate}"\n`;
    });

    // Set headers for file download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="batch_${id}_codes.csv"`,
    );

    return res.status(200).send(csvContent);
  } catch (err) {
    console.error("[DOWNLOAD_BATCH_CODES] Error:", err.message);
    return res.status(500).json({
      error: "Failed to download codes",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Please try again later",
    });
  }
}

/**
 * Download batch codes as printable PDF with QR codes
 * Generates an A4-formatted PDF that can be printed and cut
 */
export async function downloadBatchPDF(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Look up manufacturer from user
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const manufacturerId = manufacturer.id;

    // Get batch with codes and product info
    const batch = await prisma.batch.findFirst({
      where: {
        id,
        manufacturerId, // Ensure ownership
      },
      include: {
        product: {
          select: {
            name: true,
            category: true,
            skuPrefix: true,
          },
        },
        codes: {
          select: {
            id: true,
            codeValue: true,
            isUsed: true,
            createdAt: true,
            qrImagePath: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    // Generate PDF
    const pdfBuffer = await generateBatchPDF(batch, batch.codes);

    // Set headers for file download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="batch_${id}_codes.pdf"`,
    );

    return res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error("[DOWNLOAD_BATCH_PDF] Error:", err.message);
    return res.status(500).json({
      error: "Failed to generate PDF",
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
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();

  try {
    const { productId, batchId, from, to, page = 1, limit = 20 } = req.query;

    console.log(
      `[HISTORY-${requestId}] Request started for manufacturerId: ${req.user.id}`,
    );
    console.log(`[HISTORY-${requestId}] Query params:`, {
      productId,
      batchId,
      from,
      to,
      page,
      limit,
    });

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

    console.log(
      `[HISTORY-${requestId}] Query where clause:`,
      JSON.stringify(where),
    );

    const [history, total] = await Promise.all([
      prisma.verificationLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.verificationLog.count({ where }),
    ]);

    console.log(
      `[HISTORY-${requestId}] Found ${history.length} records, total: ${total}`,
    );
    console.log(`[HISTORY-${requestId}] First record sample:`, history[0]);

    const duration = Date.now() - startTime;
    console.log(`[HISTORY-${requestId}] Request completed in ${duration}ms`);

    // Map codeValue to code for API compatibility with frontend
    const historyWithCodeField = history.map((log) => ({
      ...log,
      code: log.codeValue, // Map codeValue to code for frontend
    }));

    return res.status(200).json({
      data: historyWithCodeField,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    const duration = Date.now() - startTime;
    console.error(`[HISTORY-${requestId}] Error after ${duration}ms:`, {
      message: err.message,
      code: err.code,
      stack: err.stack,
      manufacturerId: req.user?.id,
    });
    return res.status(500).json({
      error: "Failed to fetch history",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Please try again later",
      requestId,
    });
  }
}
/**
 * Update manufacturer profile information
 */
export async function updateProfile(req, res) {
  try {
    const manufacturerId = req.user?.id;
    const { name, email, phone, country, website } = req.body;

    if (!manufacturerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Update manufacturer
    const updated = await prisma.manufacturer.update({
      where: { id: manufacturerId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(country && { country }),
        ...(website && { website }),
      },
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error("[UPDATE_PROFILE] Error:", err);
    res.status(500).json({
      error: "Failed to update profile",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Please try again later",
    });
  }
}
