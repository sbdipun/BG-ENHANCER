const fetch = require('node-fetch');

exports.handler = async (event) => {
    try {
        const formData = new FormData();
        const buffer = Buffer.from(event.body, 'base64');
        formData.append('image', new Blob([buffer]), 'image.jpg');

        const response = await fetch('http://planet-accessible-dibble.glitch.me/api/enhancer', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify({ enhancedImage: result.enhancedImage })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
