// server/models/Notification.js

const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    senderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
        // Types: 'like', 'comment', 'follow', 'achievement', etc.
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false
    },
    postId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Posts',
            key: 'id'
        }
    },
    read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'Notifications',
    timestamps: true
});

module.exports = Notification;
