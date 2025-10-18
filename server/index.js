// server/index.js

const express = require('express');
const sequelize = require('./db'); // Import the centralized connection
const User = require('./models/User'); // Import the User model

const app = express();
const PORT = 3000;

// Test the database connection
async function testDbConnection() {
  try {
    await sequelize.authenticate();
    console.log('Successfully connected to the MySQL database! ✅');

    // Sync all defined models to the DB.
    await sequelize.sync({ alter: true });
    console.log("All models were synchronized successfully.");

  } catch (error) {
    console.error('Unable to connect to the database or sync models:', error);
  }
}

testDbConnection();

app.get('/', (req, res) => {
  res.json({ message: "Welcome to the Aadat API! 🎉" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});