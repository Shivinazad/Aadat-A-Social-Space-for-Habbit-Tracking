require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        console.log('Testing Gemini API...');
        console.log('API Key exists:', !!apiKey);
        console.log('API Key length:', apiKey ? apiKey.length : 0);
        
        if (!apiKey) {
            console.error('❌ No API key found!');
            return;
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        console.log('Sending test request...');
        const result = await model.generateContent('Say hello in JSON format: {"message": "hello"}');
        const response = result.response;
        const text = response.text();
        
        console.log('✅ Success! Response:', text);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    }
}

testGemini();
