const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const passport = require('../config/passport');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_default_jwt_secret_key_12345';

// POST /register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email, and password are required.' });
        }
        const existingUser = await User.findOne({ where: { email: email } });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already in use.' });
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = await User.create({ username, email, password: hashedPassword });
        const userResponse = newUser.toJSON();
        delete userResponse.password;
        res.status(201).json({ message: 'User created successfully!', user: userResponse });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Failed to register user.' });
    }
});

// POST /login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for email:', email);

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log('Invalid password for user:', email);
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
        console.log('Login successful for user:', email);
        res.status(200).json({ message: 'Login successful!', token: token });
    } catch (error) {
        console.error('Login error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: 'Server error during login.', error: error.message });
    }
});

// PUT /profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { communities, avatar, bio } = req.body;
        const userId = req.user.id;
        const user = await User.findByPk(userId);
        if (!user) { return res.status(404).json({ msg: 'User not found.' }); }

        if (communities !== undefined) user.communities = communities;
        if (avatar !== undefined) user.avatar = avatar;
        if (bio !== undefined) user.bio = bio;

        await user.save();
        res.status(200).json({
            message: 'Profile updated successfully!',
            id: user.id,
            username: user.username,
            email: user.email,
            communities: user.communities,
            avatar: user.avatar,
            bio: user.bio,
            user_level: user.user_level,
            user_xp: user.user_xp
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ msg: 'Server error updating profile.' });
    }
});

// GET /me
router.get('/me', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId, { attributes: ['id', 'username', 'email', 'user_level', 'user_xp', 'communities', 'avatar', 'bio'] });
        if (!user) { return res.status(404).json({ msg: 'User not found.' }); }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ msg: 'Server error fetching user profile.' });
    }
});

// GET /stats - Get user habit statistics
router.get('/stats', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const Habit = require('../models/Habit');
        const Completion = require('../models/Completion');
        const { Op } = require('sequelize');

        const habits = await Habit.findAll({ where: { userId } });

        // Calculate current streak (max streak across all habits)
        const currentStreak = habits.length > 0
            ? Math.max(...habits.map(h => h.currentStreak || 0))
            : 0;

        // Calculate longest streak
        const longestStreak = habits.length > 0
            ? Math.max(...habits.map(h => h.longestStreak || 0))
            : 0;

        // Calculate weekly completion rate
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const totalPossibleCheckins = habits.length * 7; // 7 days * number of habits
        const actualCheckins = await Completion.count({
            include: [{
                model: Habit,
                where: { userId },
                required: true
            }],
            where: {
                date: {
                    [Op.gte]: oneWeekAgo
                }
            }
        });

        const completionRate = totalPossibleCheckins > 0
            ? Math.round((actualCheckins / totalPossibleCheckins) * 100)
            : 0;

        const statsData = {
            currentStreak,
            longestStreak,
            completionRate,
            totalHabits: habits.length,
            totalCheckins: actualCheckins
        };

        console.log('User stats for', userId, ':', statsData);
        res.status(200).json(statsData);
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ msg: 'Server error fetching user stats.' });
    }
});

// GET /me/achievements
router.get('/me/achievements', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const Achievement = require('../models/Achievement');
        const userWithAchievements = await User.findByPk(userId, { include: [{ model: Achievement, through: { attributes: ['unlockedAt'] }, attributes: ['id', 'name', 'displayName', 'description', 'icon'] }] });
        if (!userWithAchievements) { return res.status(404).json({ msg: 'User not found.' }); }
        const achievements = userWithAchievements.Achievements || [];
        res.status(200).json(achievements);
    } catch (error) {
        console.error('Error fetching user achievements:', error);
        res.status(500).json({ msg: 'Server error fetching achievements.' });
    }
});

// PUBLIC: GET /api/users/:id - get public profile for a user
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findByPk(id, { attributes: ['id', 'username', 'user_level', 'user_xp', 'communities', 'avatar', 'bio'] });
        if (!user) return res.status(404).json({ msg: 'User not found.' });
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching public user:', error);
        res.status(500).json({ msg: 'Server error fetching user.' });
    }
});

// PUBLIC: GET /api/users/:id/achievements - get public achievements for a user
router.get('/:id/achievements', async (req, res) => {
    try {
        const id = req.params.id;
        const Achievement = require('../models/Achievement');
        const userWithAchievements = await User.findByPk(id, { include: [{ model: Achievement, through: { attributes: ['unlockedAt'] }, attributes: ['id', 'name', 'displayName', 'description', 'icon'] }] });
        if (!userWithAchievements) return res.status(404).json({ msg: 'User not found.' });
        const achievements = userWithAchievements.Achievements || [];
        res.status(200).json(achievements);
    } catch (error) {
        console.error('Error fetching public user achievements:', error);
        res.status(500).json({ msg: 'Server error fetching achievements.' });
    }
});

// PUBLIC: GET /api/users/:id/stats - get stats for a specific user
router.get('/:id/stats', async (req, res) => {
    try {
        const userId = req.params.id;
        const Habit = require('../models/Habit');
        const Completion = require('../models/Completion');
        const { Op } = require('sequelize');

        const habits = await Habit.findAll({ where: { userId } });

        const currentStreak = habits.length > 0
            ? Math.max(...habits.map(h => h.currentStreak || 0))
            : 0;

        const longestStreak = habits.length > 0
            ? Math.max(...habits.map(h => h.longestStreak || 0))
            : 0;

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const totalPossibleCheckins = habits.length * 7;
        const actualCheckins = await Completion.count({
            include: [{ model: Habit, where: { userId }, required: true }],
            where: { date: { [Op.gte]: oneWeekAgo } }
        });

        const completionRate = totalPossibleCheckins > 0
            ? Math.round((actualCheckins / totalPossibleCheckins) * 100)
            : 0;

        const statsData = {
            currentStreak,
            longestStreak,
            completionRate,
            totalHabits: habits.length,
            totalCheckins: actualCheckins
        };

        res.status(200).json(statsData);
    } catch (error) {
        console.error('Error fetching public user stats:', error);
        res.status(500).json({ msg: 'Server error fetching user stats.' });
    }
});

// ============ OAUTH ROUTES ============

// Google OAuth - Initiate
router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// Google OAuth - Callback
router.get('/auth/google/callback', 
    passport.authenticate('google', { session: false }),
    (req, res) => {
        try {
            const frontendURL = process.env.CLIENT_URL || 'http://localhost:5173';
            
            if (!req.user) {
                return res.redirect(`${frontendURL}/login?error=google-auth-failed`);
            }
            
            // Generate JWT token for the user
            const token = jwt.sign({ id: req.user.id, email: req.user.email }, JWT_SECRET, { expiresIn: '7d' });
            
            // Redirect to frontend with token
            res.redirect(`${frontendURL}/auth/callback?token=${token}`);
        } catch (error) {
            console.error('Error in Google OAuth callback:', error);
            const frontendURL = process.env.CLIENT_URL || 'http://localhost:5173';
            res.redirect(`${frontendURL}/login?error=auth-failed`);
        }
    }
);

// GitHub OAuth - Initiate
router.get('/auth/github', passport.authenticate('github', {
    scope: ['user:email']
}));

// GitHub OAuth - Callback
router.get('/auth/github/callback',
    passport.authenticate('github', { session: false }),
    (req, res) => {
        try {
            const frontendURL = process.env.CLIENT_URL || 'http://localhost:5173';
            
            if (!req.user) {
                return res.redirect(`${frontendURL}/login?error=github-auth-failed`);
            }
            
            // Generate JWT token for the user
            const token = jwt.sign({ id: req.user.id, email: req.user.email }, JWT_SECRET, { expiresIn: '7d' });
            
            // Redirect to frontend with token
            res.redirect(`${frontendURL}/auth/callback?token=${token}`);
        } catch (error) {
            console.error('Error in GitHub OAuth callback:', error);
            const frontendURL = process.env.CLIENT_URL || 'http://localhost:5173';
            res.redirect(`${frontendURL}/login?error=auth-failed`);
        }
    }
);

module.exports = router;
