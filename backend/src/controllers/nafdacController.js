import { getIncidents, updateIncidentStatus, getHotspots, getPredictedHotspots } from "../services/nafdacService.js";

export async function listIncidents(req, res) {
    try {
        const incidents = await getIncidents(req.query);
        res.status(200).json(incidents);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to retrieve incidents" });
    }
}

export async function updateIncident(req, res) {
    try {
        const { incidentId } = req.params;
        const { status } = req.body;

        if (!['ACKNOWLEDGED', 'ESCALATED', 'CLOSED'].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

       const updated = await updateIncidentStatus(incidentId, status);
       res.status(200).json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update incident status" });
    }
}   

export async function getHotspotData(req, res) {
    try {
        const data = await getHotspots();
        res.status(200).json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to retrieve hotspot data" });
    }
}

export async function getPredictedHotspotsData(req, res) {
    try {
    const days = parseInt(req.query.days) || 30;
    const hotspots = await getPredictedHotspots(days);
    res.status(200).json(hotspots);
} catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate AI-predicted hotspots" });
}
}