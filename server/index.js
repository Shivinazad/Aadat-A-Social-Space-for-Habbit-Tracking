// Load environment variables (must be the first line)
require('dotenv').config();

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

// --- 1. DATABASE & MODEL IMPORTS ---
const sequelize = require('./db');
const User = require('./models/User');
const Habit = require('./models/Habit');
const Post = require('./models/Post');
const Achievement = require('./models/Achievement');
const UserAchievement = require('./models/UserAchievement');
const Like = require('./models/Like');
const Notification = require('./models/Notification');

// Import middleware
const auth = require('./middleware/auth');

// Import email service
const { sendInvitationEmail } = require('./emailService');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_jwt_secret_key_12345'; // Fallback key

// --- 2. CORS CONFIGURATION ---
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.CLIENT_URL || 'https://aadat-app.onrender.com']
  : ['http://localhost:5173', 'http://localhost:3000'];

// --- 3. DATABASE INITIALIZATION ---
async function initializeDb() {
    try {
        await sequelize.authenticate();
        const dbType = process.env.NODE_ENV === 'production' ? 'PostgreSQL' : 'MySQL';
        console.log(`Successfully connected to the ${dbType} database! ✅`);
        
        // Set up associations
        Notification.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
        Notification.belongsTo(User, { as: 'recipient', foreignKey: 'userId' });
        
        await sequelize.sync({ alter: true });
        console.log("All models were synchronized successfully.");
    } catch (error) {
        console.error('Unable to connect/sync database:', error);
        process.exit(1);
    }
}
// ---------------------------------

// --- MIDDLEWARE ---
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize DB and then start server
initializeDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});

// --- 4. HEALTH CHECK ENDPOINT ---
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- 5. API ROUTES: AUTHENTICATION ---
app.get('/api', (req, res) => {
    res.json({ message: "Welcome to the Aadat API! 🎉", version: "1.0.0" });
});

// POST /api/users/register
app.post('/api/users/register', async (req, res) => {
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

// POST /api/users/login
app.post('/api/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ message: 'Login successful!', token: token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// PUT /api/users/profile
app.put('/api/users/profile', auth, async (req, res) => {
    try {
        const { communities } = req.body;
        const userId = req.user.id;
        const user = await User.findByPk(userId);
        if (!user) { return res.status(404).json({ msg: 'User not found.' }); }
        user.communities = communities;
        await user.save();
        res.status(200).json({ message: 'Profile updated successfully!', user: { id: user.id, username: user.username, email: user.email, communities: user.communities } });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ msg: 'Server error updating profile.' });
    }
});

// GET /api/users/me
app.get('/api/users/me', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId, { attributes: ['id', 'username', 'email', 'user_level', 'user_xp', 'communities'] });
        if (!user) { return res.status(404).json({ msg: 'User not found.' }); }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ msg: 'Server error fetching user profile.' });
    }
});

// GET /api/achievements - Get all achievements with locked/unlocked status
app.get('/api/achievements', auth, async (req, res) => {
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

// GET /api/users/me/achievements
app.get('/api/users/me/achievements', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const userWithAchievements = await User.findByPk(userId, { include: [{ model: Achievement, through: { attributes: ['unlockedAt'] }, attributes: ['id', 'name', 'displayName', 'description', 'icon'] }] });
        if (!userWithAchievements) { return res.status(404).json({ msg: 'User not found.' }); }
        const achievements = userWithAchievements.Achievements || [];
        res.status(200).json(achievements);
    } catch (error) {
        console.error('Error fetching user achievements:', error);
        res.status(500).json({ msg: 'Server error fetching achievements.' });
    }
});


// --- 4. API ROUTES: HABITS ---
const habitRouter = express.Router();
app.use('/api/habits', habitRouter);

// GET /api/habits
habitRouter.get('/', auth, async (req, res) => {
    try {
        const habits = await Habit.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'ASC']] });
        return res.status(200).json(habits);
    } catch (error) {
        console.error('Error fetching habits:', error);
        return res.status(500).json({ msg: 'Server error fetching habits.' });
    }
});

// POST /api/habits
habitRouter.post('/', auth, async (req, res) => {
    const { habitTitle, habitCategory } = req.body;
    if (!habitTitle) { return res.status(400).json({ msg: 'Habit title is required.' }); }
    try {
        const newHabit = await Habit.create({ habitTitle, habitCategory, userId: req.user.id });
        return res.status(201).json({ message: 'Habit created successfully!', habit: newHabit });
    } catch (error) {
        console.error('Error creating habit:', error);
        return res.status(500).json({ msg: 'Server error creating habit.' });
    }
});

// PUT /api/habits/:id
habitRouter.put('/:id', auth, async (req, res) => {
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

// DELETE /api/habits/:id
habitRouter.delete('/:id', auth, async (req, res) => {
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


// --- 5. API ROUTES: POSTS (Check-ins & Likes) ---
const postRouter = express.Router();
app.use('/api/posts', postRouter);

// POST /api/posts - Create Post (Check-in)
postRouter.post('/', auth, async (req, res) => {
    const { content, habitId } = req.body;
    const userId = req.user.id;
    if (!content || !habitId) { return res.status(400).json({ msg: 'Post content and habitId are required.' }); }

    let awardedAchievements = [];
    try {
        const newPost = await Post.create({ content, habitId, userId });
        const habit = await Habit.findByPk(habitId);
        let currentStreak = 0;
        if (habit && habit.userId === userId) {
            habit.currentStreak += 1;
            currentStreak = habit.currentStreak;
            if (habit.currentStreak > habit.longestStreak) { habit.longestStreak = habit.currentStreak; }
            habit.lastCheckinDate = new Date();
            await habit.save();
        }
        const user = await User.findByPk(userId);
        if (user) { user.user_xp += 10; await user.save(); }

        // Achievement Check Logic
        try {
            const firstPostAch = await Achievement.findOne({ where: { name: 'first_post' } });
            if (firstPostAch && !(await UserAchievement.findOne({ where: { userId, achievementId: firstPostAch.id } }))) {
                await UserAchievement.create({ userId, achievementId: firstPostAch.id });
                awardedAchievements.push(firstPostAch);
            }
            if (currentStreak >= 3) {
                const streak3Ach = await Achievement.findOne({ where: { name: 'streak_3_day' } });
                if (streak3Ach && !(await UserAchievement.findOne({ where: { userId, achievementId: streak3Ach.id } }))) {
                    await UserAchievement.create({ userId, achievementId: streak3Ach.id });
                    awardedAchievements.push(streak3Ach);
                }
            }
        } catch (achieveError) { console.error("Error checking/awarding achievements:", achieveError); }

        return res.status(201).json({ message: 'Check-in successful!', post: newPost, habit: habit, awardedAchievements: awardedAchievements });
    } catch (error) {
        console.error('Error creating post:', error);
        return res.status(500).json({ msg: 'Server error creating post.' });
    }
});

// GET /api/posts - Get Feed Posts (with Like status)
postRouter.get('/', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const posts = await Post.findAll({
            order: [['createdAt', 'DESC']],
            include: [
                { model: User, attributes: ['id', 'username'] },
                { model: Habit, attributes: ['id', 'habitTitle'] }
            ]
        });
        const userLikes = await Like.findAll({ where: { userId: userId }, attributes: ['postId'] });
        const likedPostIds = new Set(userLikes.map(like => like.postId));
        const postsWithLikeStatus = posts.map(postInstance => {
            const post = postInstance.get({ plain: true });
            return { ...post, isLikedByCurrentUser: likedPostIds.has(post.id) };
        });
        return res.status(200).json(postsWithLikeStatus);
    } catch (error) {
        console.error('Error fetching posts:', error);
        return res.status(500).json({ msg: 'Server error fetching posts.' });
    }
});

// --- CORRECTED LIKE ROUTE ---
// POST /api/posts/:id/like - Like a Post
postRouter.post('/:id/like', auth, async (req, res) => {
    const postId = req.params.id;
    const likerUserId = req.user.id;
    try {
        const existingLike = await Like.findOne({ where: { userId: likerUserId, postId: postId } });
        if (existingLike) {
            return res.status(409).json({ msg: 'You have already liked this post.' });
        }
        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found.' });
        }
        await Like.create({ userId: likerUserId, postId: postId });
        const author = await User.findByPk(post.userId); // Ensure post model includes userId
        if (author) {
            author.user_xp += 5; // Award XP
            await author.save();
            
            // Create notification for post author (if not liking own post)
            if (likerUserId !== post.userId) {
                const liker = await User.findByPk(likerUserId);
                await Notification.create({
                    userId: post.userId,
                    senderId: likerUserId,
                    type: 'like',
                    message: `liked your post`,
                    postId: postId,
                    read: false
                });
            }
        }
        return res.status(200).json({ message: 'Post liked successfully! Author awarded XP.' });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
             return res.status(409).json({ msg: 'You have already liked this post.' });
        }
        console.error('Error liking post:', error);
        return res.status(500).json({ msg: 'Server error liking post.' });
    }
});


// --- 6. API ROUTES: LEADERBOARD ---
// GET /api/leaderboard
app.get('/api/leaderboard', auth, async (req, res) => {
    try {
        const topUsers = await User.findAll({ order: [['user_xp', 'DESC']], limit: 10, attributes: ['id', 'username', 'user_level', 'user_xp'] });
        res.status(200).json(topUsers);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ msg: 'Server error fetching leaderboard.' });
    }
});

// --- 7. API ROUTES: NOTIFICATIONS ---
// GET /api/notifications - Get user's notifications
app.get('/api/notifications', auth, async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit: 50,
            include: [{
                model: User,
                as: 'sender',
                attributes: ['username']
            }]
        });

        // Map to include sender username
        const notificationsWithSender = notifications.map(notification => ({
            id: notification.id,
            type: notification.type,
            message: notification.message,
            postId: notification.postId,
            read: notification.read,
            createdAt: notification.createdAt,
            senderUsername: notification.sender ? notification.sender.username : null
        }));

        res.status(200).json(notificationsWithSender);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ msg: 'Server error fetching notifications.' });
    }
});

// PUT /api/notifications/mark-read - Mark all notifications as read
app.put('/api/notifications/mark-read', auth, async (req, res) => {
    try {
        await Notification.update(
            { read: true },
            { where: { userId: req.user.id, read: false } }
        );
        res.status(200).json({ message: 'All notifications marked as read.' });
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        res.status(500).json({ msg: 'Server error marking notifications as read.' });
    }
});

// POST /api/invite - Send email invitation to a friend
app.post('/api/invite', auth, async (req, res) => {
    try {
        const { email } = req.body;
        const sender = await User.findByPk(req.user.id);

        if (!email) {
            return res.status(400).json({ msg: 'Email address is required.' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ msg: 'Invalid email address.' });
        }

        // Check if user already exists with this email
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ msg: 'This user is already on Aadat!' });
        }

        // Send the invitation email
        try {
            await sendInvitationEmail(email, sender.username);
            console.log(`Invitation email sent from ${sender.username} to ${email}`);
            
            res.status(200).json({ 
                message: 'Invitation sent successfully!',
                invitedEmail: email,
                invitedBy: sender.username
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Still return success to user, but log the error
            // In production, you might want to queue this for retry
            res.status(200).json({ 
                message: 'Invitation queued! (Email service temporarily unavailable)',
                invitedEmail: email,
                invitedBy: sender.username
            });
        }
    } catch (error) {
        console.error('Error sending invitation:', error);
        res.status(500).json({ msg: 'Server error sending invitation.' });
    }
});

// PUT /api/notifications/:id/read - Mark single notification as read
app.put('/api/notifications/:id/read', auth, async (req, res) => {
    try {
        const notification = await Notification.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        
        if (!notification) {
            return res.status(404).json({ msg: 'Notification not found.' });
        }

        notification.read = true;
        await notification.save();
        
        res.status(200).json({ message: 'Notification marked as read.' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ msg: 'Server error marking notification as read.' });
    }
});

// --- SERVE REACT BUILD IN PRODUCTION ---
if (process.env.NODE_ENV === 'production') {
    // Serve static files from React build
    app.use(express.static(path.join(__dirname, '../client-react/dist')));
    
    // Handle React routing - send all non-API requests to React app
    // Express 5 requires regex pattern instead of '*'
    app.get(/^(?!\/api).*/, (req, res) => {
        res.sendFile(path.join(__dirname, '../client-react/dist/index.html'));
    });
    
    console.log('📦 Serving React build from /dist');
}