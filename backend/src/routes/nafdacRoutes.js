import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { 
    listIncidents, 
    updateIncident, 
    getHotspotData, 
    getPredictedHotspotsData,
    getDashboardMetrics,
    getProductsList,
    blockProduct,
    getReportsList,
    escalateReport,
    getManufacturersList,
    getAuditLogs
} from '../controllers/nafdacController.js';

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware('NAFDAC', 'ADMIN'));

// Existing endpoints
router.get('/incidents', listIncidents);
router.patch('/incidents/:incidentId/status', updateIncident);
router.get('/hotspots', getHotspotData);
router.get('/hotspots/predicted', getPredictedHotspotsData);

// Dashboard endpoints
router.get('/dashboard', getDashboardMetrics);

// Products endpoints
router.get('/products', getProductsList);
router.post('/products/:productId/block', blockProduct);

// Reports endpoints
router.get('/reports', getReportsList);
router.post('/reports/:reportId/escalate', escalateReport);

// Manufacturers endpoints
router.get('/manufacturers', getManufacturersList);

// Audit logs endpoints
router.get('/audit-logs', getAuditLogs);

export default router;