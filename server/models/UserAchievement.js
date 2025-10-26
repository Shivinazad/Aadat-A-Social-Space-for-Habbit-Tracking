// server/models/UserAchievement.js

const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');
const Achievement = require('./Achievement');

const UserAchievement = sequelize.define('UserAchievement', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    unique: 'user_achievement_unique' // Ensure a user can only get an achievement once
  },
  achievementId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Achievement,
      key: 'id',
    },
    unique: 'user_achievement_unique' // Ensure a user can only get an achievement once
  },
  unlockedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

// Define Many-to-Many relationship
User.belongsToMany(Achievement, { through: UserAchievement, foreignKey: 'userId' });
Achievement.belongsToMany(User, { through: UserAchievement, foreignKey: 'achievementId' });

module.exports = UserAchievement;