const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { HabitMongo } = require('../models-mongo');
const auth = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { emitDataChanged, emitUserDataChanged } = require('../realtime/socketEvents');
const router = express.Router();
const engine = 'mongo';

const isMongo = () => engine === 'mongo';
const buildFallbackRoadmap = (habitTitle, description) => {
    const title = habitTitle || 'Your habit';
    const context = description || 'your goal';

    return [
        {
            checkpoint: 1,
            day: 1,
            title: `Define the ${title} baseline`,
            overview: `Set a realistic starting point for ${title.toLowerCase()} and make the first action extremely small so you can win on day one.`,
            actionSteps: [
                'Write one sentence describing the exact outcome you want',
                'Choose a daily minimum version of the habit that takes 5-10 minutes',
                'Do the habit once and mark it as complete'
            ],
            tips: [
                `Keep the first version focused on ${context.toLowerCase()}`,
                'Remove friction by preparing everything the night before',
                'Track completion in the app immediately after doing it'
            ],
            difficulty: 'Beginner'
        },
        {
            checkpoint: 2,
            day: 5,
            title: `Build consistency for ${title}`,
            overview: `Turn ${title.toLowerCase()} into a repeatable routine by repeating the same steps on the same trigger each day.`,
            actionSteps: [
                'Repeat the habit for 3-5 consecutive days',
                'Attach the habit to a fixed trigger like waking up or finishing work',
                'Review what made it easy or hard'
            ],
            tips: [
                'Use the same time and place each day',
                'If you miss a day, restart the next day without guilt',
                'Keep the habit simple enough to finish on low-energy days'
            ],
            difficulty: 'Beginner'
        },
        {
            checkpoint: 3,
            day: 10,
            title: `Add structure and tracking`,
            overview: `Start tracking patterns so you can see how ${title.toLowerCase()} fits into your weekly routine.`,
            actionSteps: [
                'Log each completion in the app right after finishing',
                'Note one short reflection about what helped you succeed',
                'Increase the habit duration slightly if the habit feels easy'
            ],
            tips: [
                'Look for the time of day when you are most consistent',
                'If the habit is too hard, shrink the target instead of skipping',
                'Celebrate streaks, not perfection'
            ],
            difficulty: 'Intermediate'
        },
        {
            checkpoint: 4,
            day: 15,
            title: `Raise the challenge gently`,
            overview: `Increase the difficulty of ${title.toLowerCase()} just enough to keep progressing without losing momentum.`,
            actionSteps: [
                'Add one more set, minute, page, or rep to the habit',
                'Keep the schedule unchanged so the trigger stays automatic',
                'Check whether the harder version still feels sustainable'
            ],
            tips: [
                'Only increase one variable at a time',
                'If motivation drops, return to the baseline version temporarily',
                'Use reminders or alerts if you keep forgetting'
            ],
            difficulty: 'Intermediate'
        },
        {
            checkpoint: 5,
            day: 20,
            title: `Protect the streak`,
            overview: `Focus on consistency systems so ${title.toLowerCase()} survives busy days and low-energy moments.`,
            actionSteps: [
                'Create a backup plan for your busiest day of the week',
                'Identify one common obstacle and write a workaround',
                'Keep the habit visible through a checklist or app reminder'
            ],
            tips: [
                'Plan for interruptions before they happen',
                'Use a minimum viable version if your schedule is chaotic',
                'Review your streak history to find weak spots'
            ],
            difficulty: 'Intermediate'
        },
        {
            checkpoint: 6,
            day: 25,
            title: `Lock in the habit system`,
            overview: `By now ${title.toLowerCase()} should feel more automatic, so this checkpoint is about making it permanent.`,
            actionSteps: [
                'Decide what your long-term maintenance version looks like',
                'Set a weekly review to catch missed days early',
                'Plan your next 30 days of progress once this habit is stable'
            ],
            tips: [
                'Think in months, not just days',
                'Keep the habit in your calendar or routine even after the challenge ends',
                'Reflect on what made this version stick'
            ],
            difficulty: 'Advanced'
        }
    ];
};

const generateRoadmapPayload = async ({ habitTitle, description }) => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return { roadmap: buildFallbackRoadmap(habitTitle, description), generatedBy: 'fallback' };
    }

    try {
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

        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsedData = JSON.parse(text);
        return { roadmap: parsedData.roadmap || parsedData, generatedBy: 'gemini' };
    } catch (error) {
        console.warn('Falling back to local roadmap generation:', error.message);
        return { roadmap: buildFallbackRoadmap(habitTitle, description), generatedBy: 'fallback' };
    }
};
const findHabitsForUser = (userId) => (isMongo()
    ? HabitMongo.find({ userId }).sort({ createdAt: 1 })
    : Habit.findAll({ where: { userId }, order: [['createdAt', 'ASC']] }));
const countHabitsForUser = (userId) => (isMongo()
    ? HabitMongo.countDocuments({ userId })
    : Habit.count({ where: { userId } }));
const findHabitById = (habitId) => (isMongo() ? HabitMongo.findById(habitId) : Habit.findByPk(habitId));
const updateHabitById = (habitId, userId, payload) => (isMongo()
    ? HabitMongo.findOneAndUpdate({ _id: habitId, userId }, payload, { new: true })
    : Habit.update(payload, { where: { id: habitId, userId } }));
const deleteHabitById = (habitId, userId) => (isMongo()
    ? HabitMongo.deleteOne({ _id: habitId, userId })
    : Habit.destroy({ where: { id: habitId, userId } }));

router.get('/export', auth, async (req, res) => {
    try {
        const habits = await findHabitsForUser(req.user.id);

        const csvLines = ['ID,Title,Category,Current Streak,Created At'];
        habits.forEach(h => {
            const title = `"${(h.habitTitle || '').replace(/"/g, '""')}"`;
            const category = `"${(h.habitCategory || '').replace(/"/g, '""')}"`;
            const habitId = h.id || h._id;
            csvLines.push(`${habitId},${title},${category},${h.currentStreak || 0},${h.createdAt}`);
        });
        const csvContent = csvLines.join('\n');

        const tmpFile = path.join(os.tmpdir(), `habits_${req.user.id}_${Date.now()}.csv`);
        fs.writeFileSync(tmpFile, csvContent, 'utf8');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="my_habits.csv"');

        const readStream = fs.createReadStream(tmpFile);
        readStream.pipe(res);

        readStream.on('end', () => fs.unlink(tmpFile, () => {}));
        readStream.on('error', (err) => {
            console.error('Error streaming CSV:', err);
            if (!res.headersSent) res.status(500).json({ msg: 'Failed to stream file.' });
        });
    } catch (error) {
        console.error('Error exporting habits:', error);
        return res.status(500).json({ msg: 'Server error exporting habits.' });
    }
});

// GET /
router.get('/', auth, async (req, res) => {
    try {
        const habits = await findHabitsForUser(req.user.id);
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
        const habitCount = await countHabitsForUser(req.user.id);
        if (habitCount >= 5) {
            return res.status(400).json({ msg: 'Maximum 5 habits allowed. Delete a habit to add a new one.' });
        }

                let roadmapData = null;
                let roadmapSource = null;

        if (generateRoadmap && description) {
            try {
                                const result = await generateRoadmapPayload({ habitTitle, description });
                                roadmapData = result.roadmap;
                                roadmapSource = result.generatedBy;
            } catch (error) {
                console.error('Failed to generate roadmap:', error.message);
            }
        }

        const newHabit = await (isMongo()
            ? HabitMongo.create({ 
                habitTitle, 
                habitCategory, 
                description,
                aiDescription: aiDescription || null,
                roadmap: roadmapData,
                userId: req.user.id
            })
            : Habit.create({ 
                habitTitle, 
                habitCategory, 
                description,
                aiDescription: aiDescription || null,
                roadmap: roadmapData,
                userId: req.user.id 
            }));

        const newHabitId = newHabit.id || newHabit._id;
        emitDataChanged({ scope: 'habits', action: 'created', habitId: newHabitId?.toString?.(), userId: req.user.id });
        emitUserDataChanged(req.user.id, { scope: 'dashboard', action: 'habit-created', habitId: newHabitId?.toString?.() });

        return res.status(201).json({ message: 'Habit created successfully!', habit: newHabit, roadmapSource });
    } catch (error) {
        console.error('Error creating habit:', error);
        return res.status(500).json({ msg: 'Server error creating habit.' });
    }
});

router.post('/generate-roadmap', auth, async (req, res) => {
    const { description, habitTitle } = req.body;

    if (!description) {
        return res.status(400).json({ msg: 'Habit description is required for AI generation.' });
    }

    try {
                const result = await generateRoadmapPayload({ habitTitle, description });
                return res.status(200).json(result);
    } catch (error) {
        console.error('Error generating roadmap:', error);
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
        if (isMongo()) {
            const updatedHabit = await updateHabitById(habitId, req.user.id, { habitTitle, habitCategory });
            if (!updatedHabit) { return res.status(404).json({ msg: 'Habit not found or not owned by user.' }); }
            emitDataChanged({ scope: 'habits', action: 'updated', habitId, userId: req.user.id });
            emitUserDataChanged(req.user.id, { scope: 'dashboard', action: 'habit-updated', habitId });
            return res.status(200).json({ message: 'Habit updated successfully!', habit: updatedHabit });
        }

        const [updatedRows] = await updateHabitById(habitId, req.user.id, { habitTitle, habitCategory });
        if (updatedRows === 0) { return res.status(404).json({ msg: 'Habit not found or not owned by user.' }); }
        const updatedHabit = await Habit.findByPk(habitId);
        emitDataChanged({ scope: 'habits', action: 'updated', habitId, userId: req.user.id });
        emitUserDataChanged(req.user.id, { scope: 'dashboard', action: 'habit-updated', habitId });
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
        if (isMongo()) {
            const result = await deleteHabitById(habitId, req.user.id);
            if (result.deletedCount === 0) { return res.status(404).json({ msg: 'Habit not found or not owned by user.' }); }
            emitDataChanged({ scope: 'habits', action: 'deleted', habitId, userId: req.user.id });
            emitUserDataChanged(req.user.id, { scope: 'dashboard', action: 'habit-deleted', habitId });
            return res.status(200).json({ message: 'Habit deleted successfully!' });
        }

        const result = await deleteHabitById(habitId, req.user.id);
        if (result === 0) { return res.status(404).json({ msg: 'Habit not found or not owned by user.' }); }
        emitDataChanged({ scope: 'habits', action: 'deleted', habitId, userId: req.user.id });
        emitUserDataChanged(req.user.id, { scope: 'dashboard', action: 'habit-deleted', habitId });
        return res.status(200).json({ message: 'Habit deleted successfully!' });
    } catch (error) {
        console.error('Error deleting habit:', error);
        return res.status(500).json({ msg: 'Server error deleting habit.' });
    }
});

module.exports = router;
