const fetch = require('node-fetch');
const FormData = require('form-data');

exports.handler = async (event) => {
  try {
    const form = new FormData();
    const buffer = Buffer.from(event.body, 'base64');
    form.append('image', buffer, 'image.jpg');

    const response = await fetch('http://planet-accessible-dibble.glitch.me/api/enhancer', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
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
