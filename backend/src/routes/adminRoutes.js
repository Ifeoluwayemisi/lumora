import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';

import {
    listVerifications,
    listIncidents,
    listHighRiskCodes,
    listPredictedHotspots
} from '../controllers/adminController.js';

const router = express.router;

//auth and admin routes
router.use(authMiddleware);
router.use(roleMiddleware('ADMIN'));

//routes
router.get('/verifications, listVerifications'); //paginated
router.get('/incidents', listIncidents); //optional status filter
router.get('/high-risk-codes', listHighRiskCodes);
router.get('/hotspots/predicted', listPredictedHotspots); //optional ai layer

export default router;