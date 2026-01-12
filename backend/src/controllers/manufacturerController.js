import prisma from "../models/prismaClient.js";
import {
  createProduct,
  createBatchWithCodes,
} from "../services/manufacturerService.js";
import { parseISO, isValid } from "date-fns";

/**
 * CREATE PRODUCT
 */
export async function addProduct(req, res) {
  try {
    const { name, description } = req.body;

    const product = await createProduct({
      manufacturerId: req.user.id,
      name,
      description,
    });

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * CREATE BATCH + CODES
 */
export async function addBatch(req, res) {
  try {
    const { productId, productionDate, expiryDate, quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: "quantity is required" });
    }

    const prodDate = parseISO(productionDate);
    const expDate = parseISO(expiryDate);

    if (!isValid(prodDate) || !isValid(expDate)) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const { batch, createdCodes } = await createBatchWithCodes({
      productId,
      manufacturerId: req.user.id,
      productionDate: prodDate,
      expirationDate: expDate,
      quantity,
    });

    res.status(201).json({
      batch, // return batch object directly
      generatedCodes: createdCodes.length, // count of codes
    });
  } catch (err) {
    console.error(err);

    // Return error message from service if it exists
    res.status(500).json({
      error:
        err.message ||
        "Daily code limit reached or something went wrong. Upgrade to PREMIUM to generate more codes.",
    });
  }
}


/**
 * MANUFACTURER HISTORY (Verification logs)
 */
export async function getManufacturerHistory(req, res) {
  try {
    const { productId, batchId, from, to, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.min(Number(limit), 100);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      manufacturerId: req.user.id,
    };

    if (productId) where.productId = productId;
    if (batchId) where.batchId = batchId;

    if (from || to) {
      where.createdAt = {};
      if (from && isValid(parseISO(from))) where.createdAt.gte = parseISO(from);
      if (to && isValid(parseISO(to))) where.createdAt.lte = parseISO(to);
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

    res.json({
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      history,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
}
