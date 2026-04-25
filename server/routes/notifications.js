const express = require('express');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { NotificationMongo, UserMongo } = require('../models-mongo');
const auth = require('../middleware/auth');
const { emitUserDataChanged } = require('../realtime/socketEvents');
const router = express.Router();
const engine = 'mongo';

const isMongo = () => engine === 'mongo';

// GET / - Get user's notifications
router.get('/', auth, async (req, res) => {
    try {
        if (isMongo()) {
            const notifications = await NotificationMongo.find({ userId: req.user.id })
                .sort({ createdAt: -1 })
                .limit(50)
                .populate('senderId', 'username');

            const notificationsWithSender = notifications.map((notification) => ({
                id: notification._id,
                type: notification.type,
                message: notification.message,
                postId: notification.postId,
                read: notification.read,
                createdAt: notification.createdAt,
                senderUsername: notification.senderId ? notification.senderId.username : null
            }));

            return res.status(200).json(notificationsWithSender);
        }

        const notifications = await Notification.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit: 50,
            include: [{
                model: User,
                as: 'sender',
                attributes: ['username']
            }]
        });

        const notificationsWithSender = notifications.map(notification => ({
            id: notification.id,
            type: notification.type,
            message: notification.message,
            postId: notification.postId,
            read: notification.read,
            createdAt: notification.createdAt,
            senderUsername: notification.sender ? notification.sender.username : null
        }));

        res.status(200).json(notificationsWithSender);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ msg: 'Server error fetching notifications.' });
    }
});

// PUT /mark-read - Mark all notifications as read
router.put('/mark-read', auth, async (req, res) => {
    try {
        if (isMongo()) {
            await NotificationMongo.updateMany({ userId: req.user.id, read: false }, { $set: { read: true } });
            emitUserDataChanged(req.user.id, { scope: 'notifications', action: 'mark-all-read' });
            return res.status(200).json({ message: 'All notifications marked as read.' });
        }

        await Notification.update(
            { read: true },
            { where: { userId: req.user.id, read: false } }
        );
        emitUserDataChanged(req.user.id, { scope: 'notifications', action: 'mark-all-read' });
        res.status(200).json({ message: 'All notifications marked as read.' });
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        res.status(500).json({ msg: 'Server error marking notifications as read.' });
    }
});

// PUT /:id/read - Mark single notification as read
router.put('/:id/read', auth, async (req, res) => {
    try {
        if (isMongo()) {
            const notification = await NotificationMongo.findOne({ _id: req.params.id, userId: req.user.id });
            if (!notification) {
                return res.status(404).json({ msg: 'Notification not found.' });
            }
            notification.read = true;
            await notification.save();
            emitUserDataChanged(req.user.id, { scope: 'notifications', action: 'mark-one-read', notificationId: req.params.id });
            return res.status(200).json({ message: 'Notification marked as read.' });
        }

        const notification = await Notification.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!notification) {
            return res.status(404).json({ msg: 'Notification not found.' });
        }
        notification.read = true;
        await notification.save();
        emitUserDataChanged(req.user.id, { scope: 'notifications', action: 'mark-one-read', notificationId: req.params.id });
        res.status(200).json({ message: 'Notification marked as read.' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ msg: 'Server error marking notification as read.' });
    }
});

module.exports = router;
