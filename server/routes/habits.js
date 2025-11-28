const express = require('express');
const Habit = require('../models/Habit');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /
router.get('/', auth, async (req, res) => {
    try {
        const habits = await Habit.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'ASC']] });
        return res.status(200).json(habits);
    } catch (error) {
        console.error('Error fetching habits:', error);
        return res.status(500).json({ msg: 'Server error fetching habits.' });
    }
});

// POST /
router.post('/', auth, async (req, res) => {
    const { habitTitle, habitCategory } = req.body;
    if (!habitTitle) { return res.status(400).json({ msg: 'Habit title is required.' }); }
    try {
        // Check if user already has 5 habits (limit)
        const habitCount = await Habit.count({ where: { userId: req.user.id } });
        if (habitCount >= 5) {
            return res.status(400).json({ msg: 'Maximum 5 habits allowed. Delete a habit to add a new one.' });
        }

        const newHabit = await Habit.create({ habitTitle, habitCategory, userId: req.user.id });
        return res.status(201).json({ message: 'Habit created successfully!', habit: newHabit });
    } catch (error) {
        console.error('Error creating habit:', error);
        return res.status(500).json({ msg: 'Server error creating habit.' });
    }
});

// PUT /:id
router.put('/:id', auth, async (req, res) => {
    const habitId = req.params.id;
    const { habitTitle, habitCategory } = req.body;
    try {
        const [updatedRows] = await Habit.update({ habitTitle, habitCategory }, { where: { id: habitId, userId: req.user.id } });
        if (updatedRows === 0) { return res.status(404).json({ msg: 'Habit not found or not owned by user.' }); }
        const updatedHabit = await Habit.findByPk(habitId);
        return res.status(200).json({ message: 'Habit updated successfully!', habit: updatedHabit });
    } catch (error) {
        console.error('Error updating habit:', error);
        return res.status(500).json({ msg: 'Server error updating habit.' });
    }
});

// DELETE /:id
router.delete('/:id', auth, async (req, res) => {
    const habitId = req.params.id;
    try {
        const result = await Habit.destroy({ where: { id: habitId, userId: req.user.id } });
        if (result === 0) { return res.status(404).json({ msg: 'Habit not found or not owned by user.' }); }
        return res.status(200).json({ message: 'Habit deleted successfully!' });
    } catch (error) {
        console.error('Error deleting habit:', error);
        return res.status(500).json({ msg: 'Server error deleting habit.' });
    }
});

module.exports = router;
