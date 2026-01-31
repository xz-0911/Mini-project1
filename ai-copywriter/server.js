const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load environment variables
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve HTML files

// API Key - Read from environment variable (never hardcode!)
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Check if API key exists
if (!ANTHROPIC_API_KEY) {
    console.error('❌ Error: ANTHROPIC_API_KEY environment variable not found');
    console.error('Please create a .env file and add: ANTHROPIC_API_KEY=your_api_key_here');
    process.exit(1);
}

// Generate copy API endpoint
app.post('/api/generate', async (req, res) => {
    try {
        const { topic, tone, length } = req.body;

        // Validate request parameters
        if (!topic || !tone || !length) {
            return res.status(400).json({ 
                error: 'Missing required parameters' 
            });
        }

        const toneMap = {
            'professional': 'professional and formal',
            'friendly': 'friendly and approachable',
            'exciting': 'exciting and enthusiastic',
            'humorous': 'humorous and witty',
            'elegant': 'elegant and sophisticated',
            'casual': 'casual and relaxed'
        };

        const lengthMap = {
            'short': '50-100 word short copy',
            'medium': '100-200 word medium-length copy',
            'long': '200-300 word long copy'
        };

        const prompt = `Create a ${lengthMap[length]} with a ${toneMap[tone]} tone for the following topic:

Topic: ${topic}

Requirements:
1. The copy should be creative and engaging
2. Match the specified tone
3. Keep the word count within the specified range
4. Output only the copy content without additional explanations`;

        // Call Anthropic API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1024,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'API request failed');
        }

        const data = await response.json();
        const generatedText = data.content[0].text;

        // Return generated copy
        res.json({ 
            success: true,
            content: generatedText 
        });

    } catch (error) {
        console.error('Copy generation error:', error);
        res.status(500).json({ 
            success: false,
            error: error.message || 'Failed to generate copy. Please try again.' 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Place HTML files in the public folder`);
});
