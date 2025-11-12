import axios from 'axios';

const CHATGPT_API_URL = 'https://api.openai.com/v1/chat/completions';
const API_KEY = process.env.CHATGPT_API_KEY;

export const generateAdVariants = async (product, targetAudience, platform, vibe) => {
    const prompt = `Generate 3-6 advertisement variants for a product: "${product}", targeting: "${targetAudience}", suitable for: "${platform}", with a vibe of: "${vibe}".`;

    try {
        const response = await axios.post(CHATGPT_API_URL, {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        return response.data.choices.map(choice => choice.message.content);
    } catch (error) {
        console.error('Error generating ad variants:', error);
        throw new Error('Failed to generate ad variants');
    }
};