// server/models/Post.js

const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');
const Habit = require('./Habit'); // Import Habit for relationship

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  // Foreign Key for User (Author of the post)
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    }
  },
  // Foreign Key for Habit (Link post to a specific habit check-in)
  habitId: {
    type: DataTypes.INTEGER,
    allowNull: true, // A post might not always be a check-in
    references: {
      model: Habit,
      key: 'id',
    }
  }
});

// Define relationships:
User.hasMany(Post, { foreignKey: 'userId' });
Post.belongsTo(User, { foreignKey: 'userId' });

Habit.hasMany(Post, { foreignKey: 'habitId' });
Post.belongsTo(Habit, { foreignKey: 'habitId' });

module.exports = Post;