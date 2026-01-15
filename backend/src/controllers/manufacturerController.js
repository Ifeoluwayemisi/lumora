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

    // Get total batches
    const totalBatches = await prisma.batch.count({
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
          ? `Multiple rapid verifications of code ${alert.code?.substring(
              0,
              8
            )}...`
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
 * Get all products for a manufacturer
 * With pagination and search support
 */
export async function getProducts(req, res) {
  try {
    const { page = 1, limit = 10, search, category } = req.query;
    const manufacturerId = req.user.id;

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

    // Fetch products with code count
    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        skuPrefix: true,
        createdAt: true,
        _count: {
          select: { batches: true, codes: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNum,
    });

    // Get total count
    const total = await prisma.product.count({ where });

    // Transform response
    const data = products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      skuPrefix: p.skuPrefix,
      batchCount: p._count.batches,
      codeCount: p._count.codes,
      createdAt: p.createdAt,
      canEdit: p._count.codes === 0, // Can edit if no codes generated
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
    const manufacturerId = req.user.id;

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
    const manufacturerId = req.user.id;

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
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      select: { verified: true },
    });

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
    const manufacturerId = req.user.id;

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
    const manufacturerId = req.user.id;

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
    const manufacturerId = req.user.id;

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

    // Check manufacturer exists and is verified
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      select: {
        id: true,
        verified: true,
        plan: true,
      },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

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
    const manufacturerId = req.user.id;
    const { page = 1, limit = 20, productId } = req.query;

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
