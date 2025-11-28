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

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ msg: 'Invalid email address.' });
        }

        // Check if user already exists with this email
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ msg: 'This user is already on Aadat!' });
        }

        // Check if email credentials are configured
        const emailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;

        if (emailConfigured) {
            // Send the invitation email
            try {
                await sendInvitationEmail(email, sender.username);
                console.log(`✅ Invitation email sent from ${sender.username} to ${email}`);

                res.status(200).json({
                    message: `Invitation sent to ${email}! 📧`,
                    invitedEmail: email,
                    invitedBy: sender.username,
                    emailSent: true
                });
            } catch (emailError) {
                console.error('❌ Email sending failed:', emailError.message || emailError);

                // Provide fallback with shareable link
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
            // Email not configured - provide shareable link
            console.log(`📋 Invite link generated: ${sender.username} → ${email} (email service not configured)`);

            const inviteLink = process.env.CLIENT_URL || 'http://localhost:5173';

            res.status(200).json({
                message: `Invite link created for ${email}! 🔗`,
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
