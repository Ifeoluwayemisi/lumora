import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { listIncidents, updateIncident, getHotspotData, getPredictedHotspotsData } from '../controllers/nafdacController.js';

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware('NAFDAC', 'ADMIN'));

router.get('/incidents', listIncidents);
router.patch('/incidents/:incidentId/status', updateIncident);
router.get('/hotspots', getHotspotData);
router.get('/hotspots/predicted', getPredictedHotspotsData);

export default router;