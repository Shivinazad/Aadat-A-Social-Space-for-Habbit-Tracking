// server/models/User.js

const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // This imports the connection from db.js

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING, // Store the hashed password
    allowNull: false,
  },
  user_level: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  user_xp: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  communities: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: '👤',
  },
  bio: {
    type: DataTypes.STRING(150),
    defaultValue: 'Building habits in public.',
  }
});

module.exports = User;