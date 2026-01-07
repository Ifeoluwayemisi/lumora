import express from 'express';
import { generateBatchCodes } from '../controllers/codeController.js';
import {authMiddleware} from '../middleware/authMiddleware.js';
import {roleMiddleware} from '../middleware/roleMiddleware.js';

const router = express.Router();

//only verified manufacturer can generate codes
router.post(
    '/generate',
    authMiddleware,
    roleMiddleware('MANUFACTURER', 'ADMIN'),
    generateBatchCodes
);

export default router;