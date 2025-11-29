// Load environment variables (must be the first line)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const passport = require('./config/passport');
const sequelize = require('./db');

// Import Route Handlers
const authRoutes = require('./routes/auth');
const habitRoutes = require('./routes/habits');
const postRoutes = require('./routes/posts');
const leaderboardRoutes = require('./routes/leaderboard');
const notificationRoutes = require('./routes/notifications');
const achievementRoutes = require('./routes/achievements');
const inviteRoutes = require('./routes/invite');

// Import Models (to ensure they are registered with Sequelize)
// Note: Routes import them too, but good to be explicit or ensure sync works.
// Since we use sequelize.sync(), we need to make sure all models are defined.
// Requiring the routes should trigger model definitions as they require the models.
// But to be safe, we can require them here or rely on routes.
const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARE ---
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true }));

// Session middleware (required for passport)
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// --- CORS CONFIGURATION ---
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://aadat-app.onrender.com',
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

// --- DATABASE INITIALIZATION ---
async function initializeDb() {
    try {
        await sequelize.authenticate();
        const dbType = process.env.NODE_ENV === 'production' ? 'PostgreSQL' : 'MySQL';
        console.log(`Successfully connected to the ${dbType} database! ✅`);

        // In development, force sync to create missing tables
        if (process.env.NODE_ENV === 'production') {
            await sequelize.sync({ alter: true });
            console.log("All models were synchronized successfully. Sync mode: ALTER TABLE");
        } else {
            await sequelize.sync({ force: false }); // force: true drops and recreates all tables, use with caution
            console.log("All models were synchronized successfully. Sync mode: CREATE MISSING TABLES");
        }
    } catch (error) {
        console.error('Unable to connect/sync database:', error);
        process.exit(1);
    }
}

// Initialize DB and then start server
initializeDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});

// --- HEALTH CHECK ENDPOINT ---
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- PUBLIC STATS ENDPOINT ---
// Kept here for simplicity as it doesn't fit neatly into authenticated routes
const User = require('./models/User');
const Habit = require('./models/Habit');
const Post = require('./models/Post');

app.get('/api/stats/public', async (req, res) => {
    try {
        const [totalUsers, totalHabits, totalCheckins] = await Promise.all([
            User.count(),
            Habit.count(),
            Post.count()
        ]);
        res.json({
            totalUsers,
            totalHabits,
            totalCheckins
        });
    } catch (error) {
        console.error('Error fetching public stats:', error);
        res.status(500).json({ message: 'Failed to fetch statistics' });
    }
});

// --- API ROUTES ---
app.get('/api', (req, res) => {
    res.json({ message: "Welcome to the Aadat API! 🎉", version: "1.0.0" });
});

app.use('/api/users', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/invite', inviteRoutes);

// --- SERVE STATIC FILES IN PRODUCTION ---
if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    app.use(express.static(path.join(__dirname, '../client-react/dist')));

    // Handle React routing, return all requests to React app
    // Use Regex to match all routes that are not API routes (though API routes are handled above)
    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(__dirname, '../client-react/dist', 'index.html'));
    });
}