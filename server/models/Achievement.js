// server/models/Achievement.js

const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Achievement = sequelize.define('Achievement', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    // A short name/identifier (e.g., 'streak_7_day', 'first_post')
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  displayName: {
    // The name shown to the user (e.g., "7-Day Streak")
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    // Explanation of how to get it
    type: DataTypes.STRING,
    allowNull: false,
  },
  icon: {
    // Emoji or icon class name
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '🏆'
  },
  // You could add criteria fields later (e.g., required_streak_length)
});

module.exports = Achievement;
