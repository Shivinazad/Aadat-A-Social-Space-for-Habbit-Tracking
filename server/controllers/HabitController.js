const HabitService = require('../services/HabitService');

class HabitController {
    static async getAll(req, res) {
        try {
            const habits = await HabitService.getAllByUserId(req.user.id);
            res.json(habits);
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }

    static async create(req, res) {
        try {
            const habit = await HabitService.create({ ...req.body, userId: req.user.id });
            res.status(201).json(habit);
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }

    static async update(req, res) {
        try {
            const habit = await HabitService.update(req.params.id, req.body);
            if (!habit) return res.status(404).json({ message: 'Habit not found' });
            res.json(habit);
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }

    static async delete(req, res) {
        try {
            const habit = await HabitService.delete(req.params.id);
            if (!habit) return res.status(404).json({ message: 'Habit not found' });
            res.json({ message: 'Habit deleted' });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
}

module.exports = HabitController;
