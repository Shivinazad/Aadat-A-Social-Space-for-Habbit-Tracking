require('dotenv').config();
const axios = require('axios');

async function testRoadmap() {
    try {
        // First login to get token
        console.log('🔐 Logging in...');
        const loginResponse = await axios.post('http://localhost:3000/api/users/login', {
            email: 'test@example.com',
            password: 'testpass123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful, got token\n');
        
        // Test roadmap generation
        console.log('🤖 Testing AI roadmap generation...');
        const roadmapResponse = await axios.post(
            'http://localhost:3000/api/habits/generate-roadmap',
            {
                habitTitle: 'Running',
                description: 'I want to build endurance for a 5K race and run 3 times per week'
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Success! Generated roadmap:');
        console.log(JSON.stringify(roadmapResponse.data, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        console.error('Full error:', error);
    }
}

testRoadmap();
