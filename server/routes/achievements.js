const express = require('express');
const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// GET / - Get all achievements with locked/unlocked status
router.get('/', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get all achievements
        const allAchievements = await Achievement.findAll({
            attributes: ['id', 'name', 'displayName', 'description', 'icon']
        });

        // Get user's unlocked achievements
        const userAchievements = await UserAchievement.findAll({
            where: { userId },
            attributes: ['achievementId', 'unlockedAt']
        });

        const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));

        // Map achievements with locked/unlocked status
        const achievementsWithStatus = allAchievements.map(ach => ({
            id: ach.id,
            name: ach.name,
            displayName: ach.displayName,
            description: ach.description,
            icon: ach.icon,
            unlocked: unlockedIds.has(ach.id),
            unlockedAt: unlockedIds.has(ach.id)
                ? userAchievements.find(ua => ua.achievementId === ach.id).unlockedAt
                : null
        }));

        res.status(200).json(achievementsWithStatus);
    } catch (error) {
        console.error('Error fetching achievements:', error);
        res.status(500).json({ msg: 'Server error fetching achievements.' });
    }
});

module.exports = router;
