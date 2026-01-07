import express from 'express';
import { authMiddleware, roleMiddleware} from '../middleware/authMiddleware.js';
import { addProduct, addBatch, createBatchCodes } from '../controllers/manufacturerController.js';

const router = express.Router();

// onlu authenticated manufacturer can access
router.use(authMiddleware, roleMiddleware('MANUFACTURER', 'ADMIN'));

router.post('/products', addProduct)