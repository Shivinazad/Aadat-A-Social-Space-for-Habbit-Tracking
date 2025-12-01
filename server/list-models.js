require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('❌ No API key found!');
            return;
        }

        console.log('Fetching available models...\n');
        
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Try to list models using a direct fetch
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error:', response.status, response.statusText);
            console.error('Error details:', errorText);
            
            if (response.status === 400) {
                console.log('\n⚠️  Your API key appears to be invalid or expired.');
                console.log('Please generate a new API key at: https://makersuite.google.com/app/apikey');
            }
            return;
        }
        
        const data = await response.json();
        console.log('✅ Available models:');
        data.models.forEach(model => {
            console.log(`- ${model.name}`);
        });
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

listModels();
