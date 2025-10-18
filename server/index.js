// server/index.js

const express = require('express');
const sequelize = require('./db');
const User = require('./models/User');
const bcrypt = require('bcrypt'); // Make sure you ran 'npm install bcrypt'

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies from requests
app.use(express.json());

// --- DATABASE CONNECTION & SYNC ---
async function initializeDb() {
  try {
    await sequelize.authenticate();
    console.log('Successfully connected to the MySQL database! ✅');
    await sequelize.sync({ alter: true }); // Sync models
    console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error('Unable to connect/sync database:', error);
  }
}
initializeDb();
// ---------------------------------

// --- API ROUTES ---

// Basic Welcome Route
app.get('/', (req, res) => {
  res.json({ message: "Welcome to the Aadat API! 🎉" });
});

// User Registration Route
app.post('/api/users/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use.' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the new user
    const newUser = await User.create({
      username: username,
      email: email,
      password: hashedPassword // Store the hashed password
    });

    // Respond with success (excluding password)
    res.status(201).json({
      message: 'User created successfully!',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Failed to register user.' });
  }
});

// ------------------

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});