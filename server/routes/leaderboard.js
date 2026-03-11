const express = require('express');
const { Op } = require('sequelize');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// GET / - Leaderboard
router.get('/', auth, async (req, res) => {
    try {
        const topUsers = await User.findAll({ order: [['user_xp', 'DESC']], limit: 10, attributes: ['id', 'username', 'user_level', 'user_xp', 'avatar'] });
        res.status(200).json(topUsers);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ msg: 'Server error fetching leaderboard.' });
    }
});

module.exports = router;
