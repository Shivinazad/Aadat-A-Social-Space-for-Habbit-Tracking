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

// GET /users/me/achievements - Get user's unlocked achievements
// Note: In index.js this was /api/users/me/achievements.
// If I mount this router at /api/achievements, this route becomes /api/achievements/users/me/achievements.
// The frontend expects /api/users/me/achievements.
// I should probably move this route to `auth.js` (users routes) or handle it here and mount it differently.
// Since it's strictly about achievements, maybe I should keep it here but change the path to just `/me`?
// If I mount it at `/api/achievements`, then `/me` becomes `/api/achievements/me`.
// The frontend calls `/api/users/me/achievements`.
// I will move this route to `auth.js` (or `users.js`) OR I will keep it here and change the frontend (which I shouldn't do if I can avoid it).
// Actually, `auth.js` handles `/api/users`. So `/me/achievements` fits there as a sub-resource of user.
// But it's also achievement related.
// I'll put it in `auth.js` to keep the URL structure `/api/users/...`.

module.exports = router;
