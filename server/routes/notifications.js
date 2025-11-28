const express = require('express');
const Notification = require('../models/Notification');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendInvitationEmail } = require('../emailService');
const router = express.Router();

// GET / - Get user's notifications
router.get('/', auth, async (req, res) => {
    try {
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

        // Map to include sender username
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
        await Notification.update(
            { read: true },
            { where: { userId: req.user.id, read: false } }
        );
        res.status(200).json({ message: 'All notifications marked as read.' });
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        res.status(500).json({ msg: 'Server error marking notifications as read.' });
    }
});

// PUT /:id/read - Mark single notification as read
router.put('/:id/read', auth, async (req, res) => {
    try {
        const notification = await Notification.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!notification) {
            return res.status(404).json({ msg: 'Notification not found.' });
        }
        notification.read = true;
        await notification.save();
        res.status(200).json({ message: 'Notification marked as read.' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ msg: 'Server error marking notification as read.' });
    }
});

// POST /invite - Send email invitation
// Note: In index.js this was /api/invite.
// If I mount this router at /api/notifications, it becomes /api/notifications/invite.
// I should probably mount this router at /api/notifications AND have a separate one for invite?
// Or just put invite in here and mount it at /api (so /api/invite)?
// Or rename this file to `routes/general.js` or similar?
// The plan said "Extract Notification routes (routes/notifications.js) ... POST /invite".
// If I mount `notifications.js` at `/api/notifications`, then `/invite` becomes `/api/notifications/invite`.
// The frontend expects `/api/invite`.
// So I should probably put `/invite` in a separate file or handle it in `index.js` or mount `notifications.js` differently.
// Actually, `invite` is not really a notification resource.
// I'll put it in `routes/invite.js` or just keep it in `index.js`?
// Or I can put it in `auth.js` (users invite users)?
// Let's put it in `notifications.js` for now but I'll need to remember to mount it correctly or move it.
// Actually, I'll create a `routes/invite.js` to be clean, or just append it to `auth.js`?
// Let's stick to the plan but be aware of the path.
// I'll put it in `notifications.js` but I will move it to `routes/invite.js` if I want to be strict about paths, OR I'll just handle the mount in `index.js` like:
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/invite', inviteRoutes);
// So I should extract it to `routes/invite.js`.
// But I didn't plan for `invite.js`.
// I'll put it in `notifications.js` and I'll export a separate router or just handle it.
// Actually, I'll just put it in `notifications.js` and in `index.js` I will mount it? No, that's messy.
// I'll add `POST /invite` to `notifications.js` but I'll need to change the frontend or the mount.
// Wait, `POST /api/invite`...
// I'll create `routes/invite.js` on the fly. It's better.

module.exports = router;
