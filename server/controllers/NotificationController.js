const { NotificationMongo } = require('../models-mongo');

class NotificationController {
    static async getAll(req, res) {
        try {
            const notifications = await NotificationMongo.find({ userId: req.user.id })
                .sort({ createdAt: -1 })
                .populate('senderId', 'username avatar');
            res.json(notifications);
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }

    static async markRead(req, res) {
        try {
            await NotificationMongo.updateMany({ userId: req.user.id, read: false }, { read: true });
            res.json({ message: 'Notifications marked as read' });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
}

module.exports = NotificationController;
