// Load environment variables (must be the first line)
require('dotenv').config(); 

const express = require('express');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken'); 
const { Sequelize, DataTypes } = require('sequelize'); 

// Import the model definitions and middleware
// IMPORTANT: Ensure these file paths are correct for your project structure
const UserModel = require('./models/User'); 
const HabitModel = require('./models/Habit'); 
const auth = require('./middleware/auth');      

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_jwt_secret_key_12345'; // Fallback key

// --- 1. DATABASE CONNECTION & MODEL SETUP ---

// Initialize Sequelize connection
const sequelize = new Sequelize(
    process.env.DB_NAME || 'aadat_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'password',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: false, // Set to true for SQL logs
    }
);

// Define and register the models
const User = UserModel(sequelize);
const Habit = HabitModel(sequelize, User); // Pass the User model to Habit for association

async function initializeDb() {
    try {
        await sequelize.authenticate();
        console.log('Successfully connected to the MySQL database! ✅');
        // This syncs both the User and the new Habit tables
        await sequelize.sync({ alter: true }); 
        console.log("All models were synchronized successfully.");
    } catch (error) {
        console.error('Unable to connect/sync database:', error);
        // Exit process if database connection fails
        process.exit(1); 
    }
}
// ---------------------------------

// Middleware to parse JSON bodies from requests
app.use(express.json());

// Initialize DB and then start server
initializeDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});

// --- 2. API ROUTES: AUTHENTICATION ---

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
            { id: user.id, email: user.email }, 
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


// --- 3. API ROUTES: HABITS (Protected by auth middleware) ---
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
                UserId: req.user.id // Filters by the authenticated user's ID
            },
            order: [['createdAt', 'ASC']]
        });

        return res.status(200).json(habits);
    } catch (error) {
        console.error('Error fetching habits:', error);
        return res.status(500).json({ msg: 'Server error fetching habits.' });
    }
});

/**
 * POST /api/habits - Create a new habit
 */
habitRouter.post('/', auth, async (req, res) => {
    const { name, description, frequency } = req.body;

    if (!name) {
        return res.status(400).json({ msg: 'Habit name is required.' });
    }

    try {
        const newHabit = await Habit.create({
            name,
            description,
            frequency: frequency || 'daily',
            UserId: req.user.id // Assign the habit to the authenticated user ID from the token
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
    const { name, description, frequency } = req.body;

    try {
        // Update, ensuring the habit ID matches AND the owner ID matches req.user.id
        const [updatedRows] = await Habit.update(
            { name, description, frequency },
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
        // Destroy, ensuring the habit ID matches AND the owner ID matches req.user.id
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
