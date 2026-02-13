const axios = require('axios');

async function getMistralResponse(messages) {
    try {
        const response = await axios.post(
            'https://api.mistral.ai/v1/chat/completions',
            {
                model: 'mistral-small-latest',
                messages: messages,
                temperature: 0.7,
                max_tokens: 1000
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Mistral API error:', error.response?.data || error.message);
        throw new Error('Failed to get AI response');
    }
}

module.exports = { getMistralResponse };