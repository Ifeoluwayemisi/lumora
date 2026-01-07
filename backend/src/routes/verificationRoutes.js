import express from 'express';
import { verifyManual, verifyQR } from '../controllers/verificationController';
import { optionalAuthMiddleware } from '../middleware/optionalAuthMiddleware';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

//manual verication, works for boyh unauth and auth users
router.post('/manual', optionalAuthMiddleware, verifyManual);

//Qr verification. Authenticated users only
router.post('/qr', authMiddleware, verifyQR);

export default router;