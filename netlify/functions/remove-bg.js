const fetch = require('node-fetch');

exports.handler = async (event) => {
    try {
        const API_TOKEN = process.env.BGR_API_TOKEN;
        const buffer = Buffer.from(event.body, 'base64');
        
        const response = await fetch('https://engine.prod.bria-api.com/v1/background/remove', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_TOKEN}`
            },
            body: JSON.stringify({
                image: buffer.toString('base64'),
                format: "png"
            })
        });

        const result = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify({ backgroundRemoved: result.result })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
