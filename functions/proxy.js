const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const data = JSON.parse(event.body);

    try {
        const response = await fetch('https://app.baseplate.ai/api/endpoints/2af21e09-6ba3-4bea-9372-c063bff8399d/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add the Authorization header here
                'Authorization': `Bearer ${process.env.BASEPLATE_API_KEY}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${await response.text()}`);
        }

        const result = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };
    } catch (error) {
        return { statusCode: 500, body: error.toString() };
    }
};
