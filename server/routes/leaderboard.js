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

// GET /users/stats - Get user habit statistics
// Note: This was /api/users/stats in index.js. I'm placing it here or I could place it in a stats.js or users.js. 
// Given the plan said "Extract Leaderboard routes (routes/leaderboard.js) - Extract leaderboard and stats routes", I'll put it here.
// But the path in index.js was /api/users/stats. If I put it in leaderboard.js mounted at /api/leaderboard, it becomes /api/leaderboard/users/stats.
// The frontend expects /api/users/stats.
// So I should probably put this in a separate file or handle the mounting carefully.
// Or I can put it in `auth.js` (which is really `users.js` + auth) or create `users.js`.
// The plan said: "Extract Leaderboard routes... GET /users/stats (moved from main app to likely a user or stats route)".
// I'll put it in `leaderboard.js` for now but I'll need to mount `leaderboard.js` at `/api` or similar to keep the path, OR mount it at `/api/leaderboard` and change the route to just `/` (for leaderboard) and maybe I should create `routes/users.js` for `/api/users/stats`.
// `auth.js` handles `/api/users/register`, `/api/users/login`, `/api/users/profile`, `/api/users/me`.
// So `auth.js` is effectively `users.js`.
// I will move `GET /api/users/stats` to `auth.js` instead of `leaderboard.js` to keep it under `/api/users`.
// Wait, I already created `auth.js` and didn't include it.
// I will append it to `auth.js` later or just put it in `leaderboard.js` and change the mount point?
// No, changing API paths breaks frontend.
// I will add it to `auth.js` in a subsequent step or just create `routes/users.js` which includes auth and stats?
// `auth.js` is mounted at `/api/users` (implied).
// Let's check `auth.js` content. It has `/register`, `/login`, `/profile`, `/me`.
// So if I mount `auth.js` at `/api/users`, then `/api/users/stats` fits perfectly there.
// I will update `auth.js` to include `/stats`.

// For now, `leaderboard.js` will only have `/` (which corresponds to `/api/leaderboard`).

module.exports = router;
