const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendInvitationEmail } = require('../emailService');
const router = express.Router();

// POST / - Send email invitation
router.post('/', auth, async (req, res) => {
    try {
        const { email } = req.body;
        const sender = await User.findByPk(req.user.id);

        if (!email) {
            return res.status(400).json({ msg: 'Email address is required.' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ msg: 'Invalid email address.' });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ msg: 'This user is already on Aadat!' });
        }

        const emailConfigured = process.env.SENDGRID_API_KEY || (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);

        if (emailConfigured) {
            try {
                await sendInvitationEmail(email, sender.username);
                res.status(200).json({
                    message: `Invitation sent to ${email}!`,
                    invitedEmail: email,
                    invitedBy: sender.username,
                    emailSent: true
                });
            } catch (emailError) {
                console.error('Email sending failed:', emailError.message || emailError);
                const inviteLink = process.env.CLIENT_URL || 'http://localhost:5173';
                res.status(200).json({
                    message: `Email service unavailable. Here's your invite link for ${email}`,
                    invitedEmail: email,
                    invitedBy: sender.username,
                    inviteLink: `${inviteLink}?invited_by=${encodeURIComponent(sender.username)}`,
                    emailSent: false
                });
            }
        } else {
            const inviteLink = process.env.CLIENT_URL || 'http://localhost:5173';
            res.status(200).json({
                message: `Invite link created for ${email}!`,
                invitedEmail: email,
                invitedBy: sender.username,
                inviteLink: `${inviteLink}?invited_by=${encodeURIComponent(sender.username)}`,
                emailSent: false,
                note: 'Share this link with your friend!'
            });
        }
    } catch (error) {
        console.error('Error processing invitation:', error);
        res.status(500).json({ msg: 'Server error processing invitation.' });
    }
});

module.exports = router;
