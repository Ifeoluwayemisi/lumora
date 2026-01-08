import {
  createProduct,
  createBatch,
  generateCodes,
} from "../services/manufacturerService.js";

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
    res.status(500).json({ error: "Failed to create product" });
  }
}

export async function addBatch(req, res) {
  try {
    const { productId, batchNumber, productionDate, expiryDate } = req.body;
    const batch = await createBatch({
      productId,
      batchNumber,
      productionDate: new Date(productionDate),
      expiryDate: newDate(expiryDate),
    });
    res.status(201).json(batch);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create batch" });
  }
}

export async function createBatchCodes(req, res) {
  try {
    const { batchId, codesCount } = req.body;
    const codes = await generateCodes({ batchId, codesCount });
    res.status(201).json({ count: codes.length, codes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate codes" });
  }
}

export async function getManufacturerHistory(req, res) {
  try {
    const manufacturerId = req.user.id;
    const { productId, batchId, from, to, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(parseInt(limit) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where = { manufacturerId };

    if (productId) where.productId = productId;
    if (batchId) where.batchId = batchId;

    if (from || to) {
      where.createdAt = {};

      if (from) {
        const fromDate = parseISO(from);
        if (isValid(fromDate)) where.createdAt.gte = fromDate;
      }

      if (to) {
        const toDate = parseISO(to);
        if (isValid(toDate)) where.createdAt.lte = toDate;
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

    res.json({
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
      history,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch manufacturer history" });
  }
}
