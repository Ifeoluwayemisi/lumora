import { generateCodesForBatch } from "../services/codeService.js";    

export async function generateBatchCodes(req, res) {
    const { drugId, batchNumber, expirationDate, quantity}= req.body;
    const manufacturerId = req.user.id; 

    try {
        //check manufacturer verification
        if(!req.user.verified) {
            return res.status(403).json({error: "Manufacturer not verified to generate codes"});
        }

        const result = await generateCodesForBatch (
            manufacturerId,
            drugId,
            batchNumber,
            new Date(expirationDate),
            quantity || 20 //default 20
        );
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Code generated failed'});
    }
}