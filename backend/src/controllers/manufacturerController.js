import prisma from "../models/prismaClient.js";
import {
  createProduct,
  createBatchWithCodes,
} from "../services/manufacturerService.js";
import { parseISO, isValid } from "date-fns";

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
 * Get all products owned by manufacturer
 */
export async function getManufacturerProducts(req, res) {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;

    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      manufacturerId: req.user.id,
    };

    // Search by product name
    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          batches: {
            select: {
              id: true,
              batchNumber: true,
              expirationDate: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.product.count({ where }),
    ]);

    // Enrich with batch count
    const enrichedProducts = products.map((product) => ({
      ...product,
      batchCount: product.batches.length,
      latestBatch: product.batches[0] || null,
    }));

    return res.status(200).json({
      data: enrichedProducts,
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
 * Get all batches owned by manufacturer
 */
export async function getManufacturerBatches(req, res) {
  try {
    const { page = 1, limit = 20, productId, status } = req.query;

    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      manufacturerId: req.user.id,
    };

    if (productId) {
      where.productId = productId;
    }

    // Filter by expiration status
    if (status === "expired") {
      where.expirationDate = {
        lt: new Date(),
      };
    } else if (status === "expiring") {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      where.expirationDate = {
        gte: new Date(),
        lte: thirtyDaysFromNow,
      };
    } else if (status === "active") {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      where.expirationDate = {
        gt: thirtyDaysFromNow,
      };
    }

    const [batches, total] = await Promise.all([
      prisma.batch.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          codes: {
            select: {
              id: true,
              isUsed: true,
              usedCount: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.batch.count({ where }),
    ]);

    // Enrich with code statistics
    const enrichedBatches = batches.map((batch) => {
      const totalCodes = batch.codes.length;
      const usedCodes = batch.codes.filter((c) => c.isUsed).length;
      const unusedCodes = totalCodes - usedCodes;
      const isExpired = batch.expirationDate < new Date();
      const daysUntilExpiry = Math.ceil(
        (batch.expirationDate - new Date()) / (1000 * 60 * 60 * 24)
      );

      return {
        ...batch,
        codeStats: {
          total: totalCodes,
          used: usedCodes,
          unused: unusedCodes,
          usagePercentage: totalCodes > 0 ? (usedCodes / totalCodes) * 100 : 0,
        },
        status: isExpired ? "expired" : daysUntilExpiry <= 30 ? "expiring" : "active",
        daysUntilExpiry: Math.max(daysUntilExpiry, 0),
      };
    });

    return res.status(200).json({
      data: enrichedBatches,
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
 * Get specific product details with all batches
 */
export async function getProductDetails(req, res) {
  try {
    const { productId } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        batches: {
          include: {
            codes: {
              select: {
                id: true,
                codeValue: true,
                isUsed: true,
                usedAt: true,
                usedCount: true,
                qrImagePath: true,
                createdAt: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check ownership
    if (product.manufacturerId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Enrich with statistics
    const stats = {
      totalBatches: product.batches.length,
      totalCodes: 0,
      usedCodes: 0,
      unusedCodes: 0,
      verificationCount: 0,
    };

    product.batches.forEach((batch) => {
      stats.totalCodes += batch.codes.length;
      stats.usedCodes += batch.codes.filter((c) => c.isUsed).length;
      stats.unusedCodes += batch.codes.filter((c) => !c.isUsed).length;
    });

    return res.status(200).json({
      product,
      stats,
    });
  } catch (err) {
    console.error("[GET_PRODUCT_DETAILS] Error:", err.message);
    return res.status(500).json({
      error: "Failed to fetch product details",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Please try again later",
    });
  }
}

/**
 * Delete product (soft delete - archive)
 */
export async function deleteProduct(req, res) {
  try {
    const { productId } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check ownership
    if (product.manufacturerId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Check if product has unused codes
    const unusedCodes = await prisma.code.count({
      where: {
        batch: {
          productId: productId,
        },
        isUsed: false,
      },
    });

    if (unusedCodes > 0) {
      return res.status(400).json({
        error: "Cannot delete product with unused codes",
        message: `This product has ${unusedCodes} unused codes. Archive batches or use all codes before deletion.`,
      });
    }

    // Delete product
    await prisma.product.delete({
      where: { id: productId },
    });

    return res.status(200).json({
      message: "Product deleted successfully",
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
