import Openai from 'openai';

const client = new Openai({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeHotspots(data) {
    /**
     * data: array of verification logs with fields:
     *  - latitude
     *  - longitude
     *  - codeValue
     *  - verificationState
     */

    const prompt = ` You are a smart regulatory AI. Analyze this verification log data from Lumora: ${JSON.stringify(data)}
    Tasks:
    1. Predict high-risk zones (lat/lng) for potential counterfeit activity.
    2. Assign a risk score (0 t0 1) for each zone.
    3. Suggest actionable insights for regulatory focus.
    
    Return JSON in the format:
    [
    { "latitude": <number>, "longitude": <number>, "riskScore": <0-1>, "advisory": "<text>" },
    ]
    `;

    const response = await client.response.create({
        model: 'gpt-4.1-mini',
        input: prompt,
    });

    // parse json safely
    try {
        const text = response.output_text || '';
        return JSON.parse(text);
    } catch (err) {
        console.error('AI response parsing error:', err);
        return [];
    }
}