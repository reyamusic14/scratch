require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGIN
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// API Routes
const generateStabilityAI = async (prompt) => {
    try {
        const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
            },
            body: JSON.stringify({
                text_prompts: [{ text: prompt }],
                cfg_scale: 7,
                height: 1024,
                width: 1024,
                steps: 30,
                samples: 1
            })
        });

        if (!response.ok) {
            throw new Error(`Stability AI API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.artifacts[0].base64;
    } catch (error) {
        console.error('Stability AI error:', error);
        throw error;
    }
};

const generateDallE = async (prompt) => {
    try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                prompt: prompt,
                n: 1,
                size: "1024x1024",
                response_format: "url"
            })
        });

        if (!response.ok) {
            throw new Error(`DALL-E API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data[0].url;
    } catch (error) {
        console.error('DALL-E error:', error);
        throw error;
    }
};

app.post('/api/generate-images', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        console.log('Received prompt:', prompt);

        if (!process.env.OPENAI_API_KEY || !process.env.STABILITY_API_KEY) {
            throw new Error('API keys not configured');
        }

        try {
            const [stabilityImage, dalleImage] = await Promise.all([
                generateStabilityAI(prompt),
                generateDallE(prompt)
            ]);

            console.log('Images generated successfully');

            res.json({
                success: true,
                images: {
                    stabilityAI: stabilityImage,
                    dalleE: dalleImage
                }
            });
        } catch (error) {
            console.error('API call error:', error);
            throw error;
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            error: 'Failed to generate images',
            message: error.message 
        });
    }
});

app.listen(port, () => {
    console.log(`