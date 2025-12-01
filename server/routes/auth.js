const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const auth = require('../middleware/auth');
const passport = require('../config/passport');
const sequelize = require('../db');
const { sendOTPEmail } = require('../emailService');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_default_jwt_secret_key_12345';

// POST /register/send-otp - Send OTP for registration
router.post('/register/send-otp', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email, and password are required.' });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already in use.' });
        }

        // Check if username already exists
        const existingUsername = await User.findOne({ where: { username } });
        if (existingUsername) {
            return res.status(409).json({ message: 'Username already taken.' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Hash password before storing
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Delete any existing OTP for this email
        await OTP.destroy({ where: { email } });
        
        // Store OTP with expiration (10 minutes)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await OTP.create({
            email,
            otp,
            username,
            password: hashedPassword,
            expiresAt,
            verified: false
        });
        
        // Respond immediately to avoid timeout
        res.status(200).json({ 
            message: 'OTP sent to your email. Please check your inbox.',
            email: email
        });
        
        // Send OTP email asynchronously (non-blocking)
        sendOTPEmail(email, otp, username)
            .then(() => {
                console.log(`✅ OTP email sent successfully to ${email}`);
            })
            .catch(emailError => {
                console.error('❌ Email sending error:', emailError);
                // Email failed but user can still proceed with OTP
            });
        
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ message: 'Failed to send OTP.' });
    }
});

// POST /register/verify-otp - Verify OTP and create account
router.post('/register/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required.' });
        }

        // Find OTP record
        const otpRecord = await OTP.findOne({ 
            where: { email, otp, verified: false },
            order: [['createdAt', 'DESC']]
        });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid OTP code.' });
        }

        // Check if OTP expired
        if (new Date() > otpRecord.expiresAt) {
            await OTP.destroy({ where: { email } });
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        // Create user account
        const newUser = await User.create({
            username: otpRecord.username,
            email: otpRecord.email,
            password: otpRecord.password
        });

        // Mark OTP as verified and delete
        await OTP.destroy({ where: { email } });

        // Generate JWT token
        const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

        const userResponse = newUser.toJSON();
        delete userResponse.password;

        res.status(201).json({ 
            message: 'Account created successfully!', 
            user: userResponse,
            token: token
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: 'Failed to verify OTP.' });
    }
});

// POST /register/resend-otp - Resend OTP
router.post('/register/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        // Find existing OTP record
        const existingOTP = await OTP.findOne({ 
            where: { email, verified: false },
            order: [['createdAt', 'DESC']]
        });

        if (!existingOTP) {
            return res.status(404).json({ message: 'No pending registration found for this email.' });
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Update OTP record
        existingOTP.otp = otp;
        existingOTP.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await existingOTP.save();
        
        // Send new OTP email
        try {
            await sendOTPEmail(email, otp, existingOTP.username);
            res.status(200).json({ message: 'New OTP sent successfully to your email.' });
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            res.status(200).json({ 
                message: 'New OTP generated.',
                warning: 'Email service may be experiencing delays.'
            });
        }
        
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ message: 'Failed to resend OTP.' });
    }
});

// POST /register (Keep old endpoint for backwards compatibility, but it will redirect to OTP flow)
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
        
        // Redirect to OTP flow
        return res.status(400).json({ 
            message: 'Please use OTP verification for registration.',
            requiresOTP: true 
        });
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

        // Calculate current streak (max streak across all habits).
        // If a habit's last check-in is older than yesterday, the streak is broken
        // and should be reset to 0. Persist the reset so subsequent reads are correct.
        const yesterday = new Date();
        yesterday.setHours(0, 0, 0, 0);
        yesterday.setDate(yesterday.getDate() - 1);

        let effectiveStreaks = [];
        for (const h of habits) {
            let effective = 0;
            if (h.lastCheckinDate) {
                const last = new Date(h.lastCheckinDate);
                last.setHours(0, 0, 0, 0);
                if (last.getTime() < yesterday.getTime()) {
                    // Streak broken; reset and persist if needed
                    if (h.currentStreak !== 0) {
                        h.currentStreak = 0;
                        try { await h.save(); } catch (e) { console.error('Error saving habit streak reset:', e); }
                    }
                    effective = 0;
                } else {
                    effective = h.currentStreak || 0;
                }
            } else {
                effective = 0;
                if (h.currentStreak !== 0) {
                    h.currentStreak = 0;
                    try { await h.save(); } catch (e) { console.error('Error saving habit streak reset (no lastCheckin):', e); }
                }
            }
            effectiveStreaks.push(effective);
        }

        const currentStreak = effectiveStreaks.length > 0 ? Math.max(...effectiveStreaks) : 0;

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

// GET /random - Get random users for testimonials
// IMPORTANT: This must come BEFORE /:id route to avoid conflict
router.get('/random', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        // Use RANDOM() for PostgreSQL (Render) and RAND() for MySQL (local)
        const randomFunc = process.env.NODE_ENV === 'production' ? 'RANDOM()' : 'RAND()';
        const users = await User.findAll({
            attributes: ['username'],
            order: sequelize.literal(randomFunc),
            limit: limit
        });
        res.json(users);
    } catch (error) {
        console.error('Error fetching random users:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
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

        // Compute effective streaks and persist resets for stale habits.
        const yesterday = new Date();
        yesterday.setHours(0, 0, 0, 0);
        yesterday.setDate(yesterday.getDate() - 1);

        let effectiveStreaks = [];
        for (const h of habits) {
            let effective = 0;
            if (h.lastCheckinDate) {
                const last = new Date(h.lastCheckinDate);
                last.setHours(0, 0, 0, 0);
                if (last.getTime() < yesterday.getTime()) {
                    if (h.currentStreak !== 0) {
                        h.currentStreak = 0;
                        try { await h.save(); } catch (e) { console.error('Error saving habit streak reset:', e); }
                    }
                    effective = 0;
                } else {
                    effective = h.currentStreak || 0;
                }
            } else {
                effective = 0;
                if (h.currentStreak !== 0) {
                    h.currentStreak = 0;
                    try { await h.save(); } catch (e) { console.error('Error saving habit streak reset (no lastCheckin):', e); }
                }
            }
            effectiveStreaks.push(effective);
        }

        const currentStreak = effectiveStreaks.length > 0 ? Math.max(...effectiveStreaks) : 0;

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
