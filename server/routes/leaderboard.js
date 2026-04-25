const express = require('express');
const { Op } = require('sequelize');
const User = require('../models/User');
const { UserMongo } = require('../models-mongo');
const auth = require('../middleware/auth');
const router = express.Router();
const engine = 'mongo';

const isMongo = () => engine === 'mongo';

// GET / - Leaderboard
router.get('/', auth, async (req, res) => {
    try {
        if (isMongo()) {
            const topUsers = await UserMongo.find({}, { username: 1, user_level: 1, user_xp: 1, avatar: 1 })
                .sort({ user_xp: -1 })
                .limit(10);
            return res.status(200).json(topUsers);
        }

        const topUsers = await User.findAll({ order: [['user_xp', 'DESC']], limit: 10, attributes: ['id', 'username', 'user_level', 'user_xp', 'avatar'] });
        res.status(200).json(topUsers);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ msg: 'Server error fetching leaderboard.' });
    }
});

module.exports = router;
