// server/models/Like.js

const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');
const Post = require('./Post');

const Like = sequelize.define('Like', {
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
    unique: 'user_post_like_unique' // Part of composite key
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Post,
      key: 'id',
    },
    unique: 'user_post_like_unique' // Part of composite key
  },
  // createdAt is automatically added by Sequelize
}, {
  // Define a composite unique key to prevent duplicate likes
  indexes: [
    {
      unique: true,
      fields: ['userId', 'postId'],
      name: 'user_post_like_unique'
    }
  ]
});

// Define relationships:
User.belongsToMany(Post, { through: Like, foreignKey: 'userId', as: 'LikedPosts' });
Post.belongsToMany(User, { through: Like, foreignKey: 'postId', as: 'Likers' });

// Optional direct associations if needed elsewhere
// Like.belongsTo(User);
// Like.belongsTo(Post);
// User.hasMany(Like);
// Post.hasMany(Like);


module.exports = Like;