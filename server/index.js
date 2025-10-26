// Load environment variables (must be the first line)
require('dotenv').config();

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// --- 1. DATABASE & MODEL IMPORTS ---
// Import the centralized sequelize connection from db.js
const sequelize = require('./db');

// Import all models
const User = require('./models/User');
const Habit = require('./models/Habit');
const Post = require('./models/Post');
const Achievement = require('./models/Achievement');     
const UserAchievement = require('./models/UserAchievement'); 

// Import middleware
const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_jwt_secret_key_12345'; // Fallback key

// --- 2. DATABASE INITIALIZATION ---
async function initializeDb() {
    try {
        await sequelize.authenticate();
        console.log('Successfully connected to the MySQL database! ✅');
        // This syncs all models defined via require('./models/User'), etc.
        await sequelize.sync({ alter: true });
        console.log("All models were synchronized successfully.");
    } catch (error) {
        console.error('Unable to connect/sync database:', error);
        process.exit(1);
    }
}
// ---------------------------------

// Middleware to parse JSON bodies from requests
app.use(cors());
app.use(express.json());

// Initialize DB and then start server
initializeDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});

// --- 3. API ROUTES: AUTHENTICATION ---

app.get('/', (req, res) => {
    res.json({ message: "Welcome to the Aadat API! 🎉" });
});

// User Registration Route: POST /api/users/register
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

        const newUser = await User.create({
            username: username,
            email: email,
            password: hashedPassword
        });

        const userResponse = newUser.toJSON();
        delete userResponse.password; // Never return the hash

        res.status(201).json({
            message: 'User created successfully!',
            user: userResponse
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Failed to register user.' });
    }
});

// User Login Route: POST /api/users/login
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

        // Generate JWT upon successful login
        const token = jwt.sign(
            { id: user.id, email: user.email }, // Use 'id' to match auth middleware
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Login successful!',
            token: token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});


// --- 4. API ROUTES: HABITS (Protected by auth middleware) ---
const habitRouter = express.Router();
// Mount the habit router under /api/habits
app.use('/api/habits', habitRouter);

/**
 * GET /api/habits - Get all habits for the authenticated user
 */
habitRouter.get('/', auth, async (req, res) => {
    try {
        const habits = await Habit.findAll({
            where: {
                // Use 'UserId' which Sequelize creates for the foreign key
                UserId: req.user.id
            }, // <-- Fixed: Closing brace was misplaced
            order: [['createdAt', 'ASC']]
        });

        return res.status(200).json(habits);
    } catch (error) {
        console.error('Error fetching habits:', error);
        return res.status(500).json({ msg: 'Server error fetching habits.' });
        // Removed stray 'content' word from here
    }
});

/**
 * POST /api/habits - Create a new habit
 */
habitRouter.post('/', auth, async (req, res) => {
    const { habitTitle, habitCategory } = req.body;

    if (!habitTitle) {
        return res.status(400).json({ msg: 'Habit title is required.' });
    }

    try {
        const newHabit = await Habit.create({
            habitTitle,
            habitCategory,
            userId: req.user.id // <-- FIXED: Changed 'UserId' to 'userId'
        });

        return res.status(201).json({
            message: 'Habit created successfully!',
            habit: newHabit
        });
    } catch (error) {
        console.error('Error creating habit:', error);
        return res.status(500).json({ msg: 'Server error creating habit.' });
    }
});

/**
 * PUT /api/habits/:id - Update a habit
 */
habitRouter.put('/:id', auth, async (req, res) => {
    const habitId = req.params.id;
    const { habitTitle, habitCategory } = req.body;

    try {
        const [updatedRows] = await Habit.update(
            { habitTitle, habitCategory },
            {
                where: {
                    id: habitId,
                    UserId: req.user.id
                }
            }
        );

        if (updatedRows === 0) {
            return res.status(404).json({ msg: 'Habit not found or not owned by user.' });
        }

        const updatedHabit = await Habit.findByPk(habitId);

        return res.status(200).json({
            message: 'Habit updated successfully!',
            habit: updatedHabit
        });
    } catch (error) {
        console.error('Error updating habit:', error);
        return res.status(500).json({ msg: 'Server error updating habit.' });
    }
});

/**
 * DELETE /api/habits/:id - Delete a habit
 */
habitRouter.delete('/:id', auth, async (req, res) => {
    const habitId = req.params.id;

    try {
        const result = await Habit.destroy({
            where: {
                id: habitId,
                UserId: req.user.id
            }
        });

        if (result === 0) {
            return res.status(404).json({ msg: 'Habit not found or not owned by user.' });
        }

        return res.status(200).json({ message: 'Habit deleted successfully!' });
    } catch (error) {
        console.error('Error deleting habit:', error);
        return res.status(500).json({ msg: 'Server error deleting habit.' });
    }
});

app.put('/api/users/profile', auth, async (req, res) => {
    try {
        const { communities } = req.body; // Get communities from request body
        const userId = req.user.id; // Get user from auth token

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        // Update the user's communities field
        user.communities = communities;
        await user.save();

        res.status(200).json({
            message: 'Profile updated successfully!',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                communities: user.communities
            }
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ msg: 'Server error updating profile.' });
    }
});

app.get('/api/users/me', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId, {
            attributes: ['id', 'username', 'email', 'user_level', 'user_xp', 'communities']
        }); // We exclude the password

        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        res.status(200).json(user);

    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ msg: 'Server error fetching user profile.' });
    }
});

app.get('/api/users/me/achievements', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        // Find the user and include their associated achievements
        const userWithAchievements = await User.findByPk(userId, {
            include: [{
                model: Achievement,
                through: { attributes: ['unlockedAt'] }, // Include unlock date via UserAchievement
                attributes: ['id', 'name', 'displayName', 'description', 'icon'] // Select achievement fields
            }]
        });

        if (!userWithAchievements) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        // Extract just the achievements data
        const achievements = userWithAchievements.Achievements || []; // 'Achievements' is the alias Sequelize creates

        res.status(200).json(achievements);

    } catch (error) {
        console.error('Error fetching user achievements:', error);
        res.status(500).json({ msg: 'Server error fetching achievements.' });
    }
});

// --- 5. API ROUTES: POSTS (Check-ins) ---
const postRouter = express.Router();
// Mount the post router under /api/posts
app.use('/api/posts', postRouter);

// --- 6. API ROUTES: LEADERBOARD ---
/**
 * GET /api/leaderboard - Get top users by XP
 */
app.get('/api/leaderboard', auth, async (req, res) => {
    try {
        // Find users, order by user_xp descending, limit to top 10
        const topUsers = await User.findAll({
            order: [['user_xp', 'DESC']],
            limit: 10,
            attributes: ['id', 'username', 'user_level', 'user_xp'] // Select only needed fields
        });

        res.status(200).json(topUsers);

    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ msg: 'Server error fetching leaderboard.' });
    }
});

/**
 * POST /api/posts - Create a new post (check-in)
 */
postRouter.post('/', auth, async (req, res) => {
    const { content, habitId } = req.body;
    const userId = req.user.id;

    if (!content || !habitId) {
        return res.status(400).json({ msg: 'Post content and habitId are required.' });
    }

    let awardedAchievements = []; // Keep track of new achievements

    try {
        // 1. Create the new post
        const newPost = await Post.create({ content, habitId, userId });

        // 2. Find the habit being checked in
        const habit = await Habit.findByPk(habitId);
        let currentStreak = 0; // Store streak for achievement check

        // 3. Update the habit's streak
        if (habit && habit.userId === userId) {
            // Basic streak logic (can be improved with date checks later)
            habit.currentStreak += 1;
            currentStreak = habit.currentStreak; // Update for achievement check
            if (habit.currentStreak > habit.longestStreak) {
                habit.longestStreak = habit.currentStreak;
            }
            habit.lastCheckinDate = new Date();
            await habit.save();
        }

        // 4. Award XP
        const user = await User.findByPk(userId);
        if (user) {
            user.user_xp += 10; // Award 10 XP per check-in
            await user.save();
        }

        // --- 5. NEW: Check & Award Achievements ---
        try {
            // Check for "First Post"
            const firstPostAchievement = await Achievement.findOne({ where: { name: 'first_post' } });
            if (firstPostAchievement) {
                // Check if user already has this achievement
                const existing = await UserAchievement.findOne({
                    where: { userId: userId, achievementId: firstPostAchievement.id }
                });
                if (!existing) {
                    // Award it!
                    await UserAchievement.create({ userId: userId, achievementId: firstPostAchievement.id });
                    awardedAchievements.push(firstPostAchievement); // Add to list
                }
            }

            // Check for "3-Day Streak" (using the updated streak from step 3)
            if (currentStreak >= 3) {
                const streak3Achievement = await Achievement.findOne({ where: { name: 'streak_3_day' } });
                if (streak3Achievement) {
                    const existing = await UserAchievement.findOne({
                        where: { userId: userId, achievementId: streak3Achievement.id }
                    });
                    if (!existing) {
                        await UserAchievement.create({ userId: userId, achievementId: streak3Achievement.id });
                        awardedAchievements.push(streak3Achievement); // Add to list
                    }
                }
            }
             // Add checks for other achievements here later (e.g., streak_7_day)

        } catch (achieveError) {
            console.error("Error checking/awarding achievements:", achieveError);
            // Continue even if achievement check fails, don't break the whole request
        }
        // ---------------------------------------------

        return res.status(201).json({
            message: 'Check-in successful!',
            post: newPost,
            habit: habit,
            awardedAchievements: awardedAchievements // Return newly awarded achievements
        });

    } catch (error) {
        console.error('Error creating post:', error);
        return res.status(500).json({ msg: 'Server error creating post.' });
    }
});



/**
 * GET /api/posts - Get all posts (for a community feed)
 */
postRouter.get('/', auth, async (req, res) => {
    try {
        // Fetch all posts, including the User and Habit info
        const posts = await Post.findAll({
            order: [['createdAt', 'DESC']], // Show newest first
            include: [
                {
                    model: User,
                    attributes: ['id', 'username'] // Only include user's ID and username
                },
                {
                    model: Habit,
                    attributes: ['id', 'habitTitle'] // Only include habit's ID and title
                }
            ]
        });
        return res.status(200).json(posts);

    } catch (error) {
        console.error('Error fetching posts:', error);
        return res.status(500).json({ msg: 'Server error fetching posts.' });
    }
});