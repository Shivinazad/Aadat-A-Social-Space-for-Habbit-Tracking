// server/models/Completion.js

const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Habit = require('./Habit');

/**
 * Defines the Sequelize Completion Model for tracking when a habit was done.
 * It links to the Habit model via HabitId.
 */
const Completion = sequelize.define('Completion', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    // The date the habit was marked complete.
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    // Sequelize automatically adds the 'HabitId' foreign key here
}, {
    tableName: 'completions',
    timestamps: true,
    updatedAt: false, // We only need the creation timestamp
});

// Association: A Completion belongs to a Habit (1:M)
Completion.belongsTo(Habit, {
    foreignKey: 'HabitId',
    allowNull: false,
    onDelete: 'CASCADE',
});

// A Habit can have many Completions
Habit.hasMany(Completion, {
    foreignKey: 'HabitId'
});

module.exports = Completion;
