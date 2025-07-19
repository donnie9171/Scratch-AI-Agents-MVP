const { app } = require('@azure/functions');
const fetch = require('node-fetch');

app.http('openaiRelay', {
    methods: ['POST'],
    authLevel: 'function',
    handler: async (request, context) => {
        // Expect JSON body with { endpoint, payload }
        let body;
        try {
            body = await request.json();
        } catch (e) {
            return { status: 400, body: 'Invalid JSON body.' };
        }
        const { endpoint, payload } = body;
        const apiKey = process.env.OPENAI_API_KEY;
        if (!endpoint || !payload) {
            return { status: 400, body: 'Missing endpoint or payload.' };
        }
        if (!apiKey) {
            return { status: 500, body: 'API key not configured.' };
        }
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            // context.log('OpenAI response:', JSON.stringify(result, null, 2));
            return { status: response.status, body: result };
        } catch (err) {
            context.log('OpenAI relay error:', err);
            return { status: 500, body: 'Error relaying to OpenAI API.' };
        }
    }
});