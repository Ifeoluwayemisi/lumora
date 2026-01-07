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
