require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const passport = require('./config/passport');
const sequelize = require('./db');

const authRoutes = require('./routes/auth');
const habitRoutes = require('./routes/habits');
const postRoutes = require('./routes/posts');
const leaderboardRoutes = require('./routes/leaderboard');
const notificationRoutes = require('./routes/notifications');
const achievementRoutes = require('./routes/achievements');
const inviteRoutes = require('./routes/invite');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const logFilePath = path.join(__dirname, 'access.log');
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

app.use((req, res, next) => {
    const logEntry = `[${new Date().toISOString()}] ${req.method} ${req.url} - IP: ${req.ip}\n`;
    logStream.write(logEntry);
    next();
});

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use(passport.initialize());
app.use(passport.session());

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

async function initializeDb() {
    try {
        await sequelize.authenticate();
        const dbType = process.env.NODE_ENV === 'production' ? 'PostgreSQL' : 'MySQL';
        console.log(`Connected to ${dbType} database`);

        if (process.env.NODE_ENV === 'production') {
            await sequelize.sync({ alter: true });
        } else {
            await sequelize.sync({ force: false });
        }
    } catch (error) {
        console.error('Unable to connect/sync database:', error);
        process.exit(1);
    }
}

initializeDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/logs/stream', (req, res) => {
    if (!fs.existsSync(logFilePath)) {
        return res.status(404).json({ message: 'Log file does not exist yet.' });
    }
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename="access.log"');
    const readStream = fs.createReadStream(logFilePath);
    readStream.on('error', (err) => {
        console.error('Error streaming log file:', err);
        res.status(500).json({ message: 'Failed to stream log file.' });
    });
    readStream.pipe(res);
});

const User = require('./models/User');
const Habit = require('./models/Habit');
const Post = require('./models/Post');
const OTP = require('./models/OTP');

app.get('/api/stats/landing', async (req, res) => {
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

app.get('/api', (req, res) => {
    res.json({ message: "Welcome to the Aadat API", version: "1.0.0" });
});

app.use('/api/users', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/invite', inviteRoutes);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client-react/dist')));
    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(__dirname, '../client-react/dist', 'index.html'));
    });
}