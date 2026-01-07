import { getAllVerifications, getAdminPredictionHotspots, getAllIncidents, getHighRiskCodes } from "../services/adminService";

export async function listVerifications(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const result = await getAllVerifications({ page, limit});
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Failed to fetch verifications'})
    }
}

export async function listIncidents(req, res) {
    try {
        const {status} = req.query;
        const incidents = await getAllIncidents({ status});
        res.status(200).json(incidents);
    } catch(err) {
        console.error(err);
        res.status(500).json({erroe: 'Failed to fetch incidents'})
    }
}

export async function listHighRiskCodes(req, res) {
    try {
        const codes = await getHighRiskCodes();
        res.status(200).json(codes);
    } catch(err) {
        console.error(err);
        res.status(500).json({error: 'Failed to fetch high-risk codes'});
    }
}

export async function listPredictedHotspots(req, res) {
    try {
        const days = parseInt(req.query.days) || 30;
        const hotspots = await getAdminPredictionHotspots(days);
        res.status(200).json(hotspots);
    } catch(err) {
        console.error(err);
        res.status(500).json({error: 'Failed to fetch AI-predicted hotspots' });
    }
}