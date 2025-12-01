// server/models/Habit.js

const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User'); // Import User to define the relationship

const Habit = sequelize.define('Habit', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  habitTitle: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  habitCategory: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  startDate: {
    type: DataTypes.DATEONLY, // Store only the date
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  currentStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  longestStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  lastCheckinDate: { // To help calculate streaks
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  aiDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  roadmap: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  targetPercentage: {
    type: DataTypes.INTEGER,
    defaultValue: 70,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    }
  }
});

// Define the relationship: A User can have many Habits
User.hasMany(Habit, { foreignKey: 'userId' });
Habit.belongsTo(User, { foreignKey: 'userId' });

module.exports = Habit;