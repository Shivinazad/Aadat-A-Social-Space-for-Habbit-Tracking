const express = require('express');
const Habit = require('../models/Habit');
const auth = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

// GET /
router.get('/', auth, async (req, res) => {
    try {
        const habits = await Habit.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'ASC']] });
        return res.status(200).json(habits);
    } catch (error) {
        console.error('Error fetching habits:', error);
        return res.status(500).json({ msg: 'Server error fetching habits.' });
    }
});

// POST /
router.post('/', auth, async (req, res) => {
    const { habitTitle, habitCategory, description, aiDescription, generateRoadmap } = req.body;
    if (!habitTitle) { return res.status(400).json({ msg: 'Habit title is required.' }); }
    
    try {
        // Check if user already has 5 habits (limit)
        const habitCount = await Habit.count({ where: { userId: req.user.id } });
        if (habitCount >= 5) {
            return res.status(400).json({ msg: 'Maximum 5 habits allowed. Delete a habit to add a new one.' });
        }

        let roadmapData = null;

        // Generate roadmap if requested
        if (generateRoadmap && description) {
            try {
                const apiKey = process.env.GEMINI_API_KEY;
                if (apiKey) {
                    console.log('🤖 Generating roadmap for habit:', habitTitle);
                    const genAI = new GoogleGenerativeAI(apiKey);
                    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

                    const prompt = `You are an expert habit-building coach. A user wants to build this habit: "${habitTitle}"

User's current situation and goal:
"${description}"

IMPORTANT INSTRUCTIONS:
1. CAREFULLY READ the user's description to understand their CURRENT SKILL LEVEL
2. If they mention they already know basics or have experience, START FROM THEIR CURRENT LEVEL, not from the beginning
3. Create a 30-day roadmap with EXACTLY 6 checkpoints spaced 4-5 days apart
4. Each checkpoint should span 4-5 days of practice/learning
5. For each checkpoint, provide SPECIFIC, ACTIONABLE resources (courses, books, videos, websites) that can be completed within the 4-5 day timeframe
6. Include realistic time estimates for each resource
7. Progress from their current level to their goal

Checkpoint spacing: Day 1, Day 5, Day 10, Day 15, Day 20, Day 25

Return ONLY valid JSON (no markdown, no code blocks):
{
  "roadmap": [
    {
      "checkpoint": 1,
      "day": 1,
      "title": "Clear milestone title matching their current level",
      "overview": "What they'll achieve in these 4-5 days, starting from their actual skill level",
      "actionSteps": [
        "Specific action with time estimate (e.g., 'Complete X course - 2 hours')",
        "Daily practice routine with duration (e.g., 'Practice 30 mins daily')",
        "Concrete deliverable or goal"
      ],
      "tips": [
        "Specific resource: 'Course/Book/Website name with URL if applicable'",
        "Specific tool or technique they should use",
        "Time management tip for completing within 4-5 days"
      ],
      "difficulty": "Beginner/Intermediate/Advanced (based on checkpoint, not user's starting level)"
    }
  ],
  "totalDays": 30,
  "estimatedCompletion": "30 days"
}`;

                    const result = await model.generateContent(prompt);
                    const response = result.response;
                    let text = response.text();
                    
                    // Clean up response
                    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                    roadmapData = JSON.parse(text);
                    console.log('✅ Roadmap generated successfully');
                }
            } catch (error) {
                console.error('Failed to generate roadmap:', error.message);
                // Continue creating habit without roadmap
            }
        }

        const newHabit = await Habit.create({ 
            habitTitle, 
            habitCategory, 
            description,
            aiDescription: aiDescription || null,
            roadmap: roadmapData,
            userId: req.user.id 
        });
        
        return res.status(201).json({ message: 'Habit created successfully!', habit: newHabit });
    } catch (error) {
        console.error('Error creating habit:', error);
        return res.status(500).json({ msg: 'Server error creating habit.' });
    }
});

// POST /generate-roadmap - Generate AI roadmap
router.post('/generate-roadmap', auth, async (req, res) => {
    const { description, habitTitle } = req.body;
    
    console.log('🤖 Generating roadmap for:', { habitTitle, description: description?.substring(0, 50) });
    
    if (!description) {
        return res.status(400).json({ msg: 'Habit description is required for AI generation.' });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        console.log('✓ API key exists:', !!apiKey);
        
        if (!apiKey) {
            return res.status(500).json({ msg: 'AI service not configured. Please add GEMINI_API_KEY to environment variables.' });
        }

        console.log('✓ Creating Gemini AI instance...');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        console.log('✓ Sending request to Gemini...');
        const prompt = `You are an expert habit-building coach. A user wants to build this habit: "${habitTitle}"

User's current situation and goal:
"${description}"

IMPORTANT INSTRUCTIONS:
1. CAREFULLY READ the user's description to understand their CURRENT SKILL LEVEL
2. If they mention they already know basics or have experience, START FROM THEIR CURRENT LEVEL, not from the beginning
3. Create a 30-day roadmap with EXACTLY 6 checkpoints spaced 4-5 days apart
4. Each checkpoint should span 4-5 days of practice/learning
5. For each checkpoint, provide SPECIFIC, ACTIONABLE resources (courses, books, videos, websites) that can be completed within the 4-5 day timeframe
6. Include realistic time estimates for each resource
7. Progress from their current level to their goal

Checkpoint spacing: Day 1, Day 5, Day 10, Day 15, Day 20, Day 25

Return ONLY valid JSON (no markdown, no code blocks):
{
  "roadmap": [
    {
      "checkpoint": 1,
      "day": 1,
      "title": "Clear milestone title matching their current level",
      "overview": "What they'll achieve in these 4-5 days, starting from their actual skill level",
      "actionSteps": [
        "Specific action with time estimate (e.g., 'Complete X course - 2 hours')",
        "Daily practice routine with duration (e.g., 'Practice 30 mins daily')",
        "Concrete deliverable or goal"
      ],
      "tips": [
        "Specific resource: 'Course/Book/Website name with URL if applicable'",
        "Specific tool or technique they should use",
        "Time management tip for completing within 4-5 days"
      ],
      "difficulty": "Beginner/Intermediate/Advanced (based on checkpoint, not user's starting level)"
    }
  ],
  "totalDays": 30,
  "estimatedCompletion": "30 days"
}`;

        const result = await model.generateContent(prompt);
        console.log('✓ Received response from Gemini');
        
        const response = result.response;
        let text = response.text();
        console.log('✓ Response text length:', text.length);
        
        // Clean up response - remove markdown code blocks if present
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        console.log('✓ Parsing JSON...');
        const roadmapData = JSON.parse(text);
        console.log('✓ Successfully parsed roadmap with', roadmapData.roadmap?.length, 'checkpoints');
        
        return res.status(200).json(roadmapData);
    } catch (error) {
        console.error('❌ Error generating roadmap:', error);
        console.error('❌ Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        return res.status(500).json({ 
            msg: 'Failed to generate roadmap. Please try again.',
            error: error.message 
        });
    }
});

// PUT /:id
router.put('/:id', auth, async (req, res) => {
    const habitId = req.params.id;
    const { habitTitle, habitCategory } = req.body;
    try {
        const [updatedRows] = await Habit.update({ habitTitle, habitCategory }, { where: { id: habitId, userId: req.user.id } });
        if (updatedRows === 0) { return res.status(404).json({ msg: 'Habit not found or not owned by user.' }); }
        const updatedHabit = await Habit.findByPk(habitId);
        return res.status(200).json({ message: 'Habit updated successfully!', habit: updatedHabit });
    } catch (error) {
        console.error('Error updating habit:', error);
        return res.status(500).json({ msg: 'Server error updating habit.' });
    }
});

// DELETE /:id
router.delete('/:id', auth, async (req, res) => {
    const habitId = req.params.id;
    try {
        const result = await Habit.destroy({ where: { id: habitId, userId: req.user.id } });
        if (result === 0) { return res.status(404).json({ msg: 'Habit not found or not owned by user.' }); }
        return res.status(200).json({ message: 'Habit deleted successfully!' });
    } catch (error) {
        console.error('Error deleting habit:', error);
        return res.status(500).json({ msg: 'Server error deleting habit.' });
    }
});

module.exports = router;
