import express from 'express';
import { authMiddleware} from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { addProduct, addBatch, createBatchCodes, getManufacturerHistory } from '../controllers/manufacturerController.js';

const router = express.Router();

// onlu authenticated manufacturer can access
router.use(authMiddleware, roleMiddleware('MANUFACTURER'));

router.post('/products', addProduct);
router.post('/batch', addBatch);
router.post('/batches/:batchId/codes', createBatchCodes);
router.get('/history', getManufacturerHistory) // how do i add Query Params: productId? batchId? from? to? page? limit?

export default router;