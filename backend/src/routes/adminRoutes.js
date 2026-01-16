import express from 'express';
import {authMiddleware} from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

import {
    listVerifications,
    listIncidents,
    listHighRiskCodes,
    listPredictedHotspots
} from '../controllers/adminController.js';

import {
    triggerMigrations,
    checkDatabaseStatus
} from '../controllers/systemController.js';

const router = express.Router();

//auth and admin routes
router.use(authMiddleware);
router.use(roleMiddleware('ADMIN'));

//routes
router.get('/verification/log', listVerifications); //paginated
router.get('/incidents', listIncidents); //optional status filter
router.get('/high-risk-codes', listHighRiskCodes);
router.get('/hotspots/predicted', listPredictedHotspots); //optional ai layer

// System management endpoints
router.post('/system/migrate', triggerMigrations);
router.get('/system/database-status', checkDatabaseStatus);

export default router;