const express = require('express');
const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');
const User = require('../models/User');
const { AchievementMongo, UserAchievementMongo } = require('../models-mongo');
const auth = require('../middleware/auth');
const router = express.Router();
const engine = 'mongo';

const isMongo = () => engine === 'mongo';

// GET / - Get all achievements with locked/unlocked status
router.get('/', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        if (isMongo()) {
            const allAchievements = await AchievementMongo.find({}, { name: 1, displayName: 1, description: 1, icon: 1 }).lean();
            const userAchievements = await UserAchievementMongo.find({ userId }, { achievementId: 1, unlockedAt: 1 }).lean();
            const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId.toString()));

            const achievementsWithStatus = allAchievements.map((ach) => ({
                id: ach._id,
                name: ach.name,
                displayName: ach.displayName,
                description: ach.description,
                icon: ach.icon,
                unlocked: unlockedIds.has(ach._id.toString()),
                unlockedAt: unlockedIds.has(ach._id.toString())
                    ? userAchievements.find((ua) => ua.achievementId.toString() === ach._id.toString()).unlockedAt
                    : null
            }));

            return res.status(200).json(achievementsWithStatus);
        }

        const allAchievements = await Achievement.findAll({
            attributes: ['id', 'name', 'displayName', 'description', 'icon']
        });

        const userAchievements = await UserAchievement.findAll({
            where: { userId },
            attributes: ['achievementId', 'unlockedAt']
        });

        const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));

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
