// server/emailService.js
const nodemailer = require('nodemailer');

// Create email transporter
// For production, use environment variables for credentials
const createTransporter = () => {
    // Using Gmail as an example
    // You'll need to enable "Less secure app access" or use App Passwords
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER || 'your-email@gmail.com',
            pass: process.env.EMAIL_PASSWORD || 'your-app-password'
        }
    });
};

// Send invitation email
const sendInvitationEmail = async (toEmail, senderName) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: `Aadat - Habit Tracker <${process.env.EMAIL_USER || 'noreply@aadat.com'}>`,
            to: toEmail,
            subject: `${senderName} invited you to join Aadat! 🚀`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .container {
                            background: #ffffff;
                            border-radius: 12px;
                            padding: 40px;
                            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                        }
                        .logo {
                            font-size: 32px;
                            font-weight: 800;
                            color: #000000;
                            letter-spacing: -0.02em;
                        }
                        .neon-dot {
                            display: inline-block;
                            width: 8px;
                            height: 8px;
                            background: #00ff88;
                            border-radius: 50%;
                            margin-left: 4px;
                        }
                        h1 {
                            color: #000000;
                            font-size: 24px;
                            margin: 20px 0;
                        }
                        .invitation-text {
                            font-size: 16px;
                            color: #666;
                            margin: 20px 0;
                        }
                        .cta-button {
                            display: inline-block;
                            padding: 14px 32px;
                            background: #000000;
                            color: #ffffff;
                            text-decoration: none;
                            border-radius: 8px;
                            font-weight: 600;
                            margin: 20px 0;
                        }
                        .features {
                            margin: 30px 0;
                            padding: 20px;
                            background: #f5f5f5;
                            border-radius: 8px;
                        }
                        .feature-item {
                            margin: 10px 0;
                            padding-left: 25px;
                            position: relative;
                        }
                        .feature-item:before {
                            content: "✓";
                            position: absolute;
                            left: 0;
                            color: #00ff88;
                            font-weight: bold;
                        }
                        .footer {
                            margin-top: 40px;
                            padding-top: 20px;
                            border-top: 1px solid #e5e5e5;
                            text-align: center;
                            font-size: 14px;
                            color: #999;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo">
                                Aadat<span class="neon-dot"></span>
                            </div>
                        </div>
                        
                        <h1>You're invited to join Aadat!</h1>
                        
                        <p class="invitation-text">
                            <strong>${senderName}</strong> thinks you'd be great at building better habits together on Aadat - 
                            a social platform designed to help you track habits, stay accountable, and celebrate progress with friends.
                        </p>
                        
                        <div style="text-align: center;">
                            <a href="http://localhost:3000" class="cta-button">
                                Join Aadat Now
                            </a>
                        </div>
                        
                        <div class="features">
                            <h3 style="margin-top: 0;">What you can do on Aadat:</h3>
                            <div class="feature-item">Track your daily habits and build streaks</div>
                            <div class="feature-item">Share progress with your friends</div>
                            <div class="feature-item">Compete on the leaderboard</div>
                            <div class="feature-item">Unlock achievements as you progress</div>
                            <div class="feature-item">Get motivated by a supportive community</div>
                        </div>
                        
                        <p style="color: #666; font-size: 14px;">
                            Start building better habits today. It's free and takes less than a minute to sign up!
                        </p>
                        
                        <div class="footer">
                            <p>This invitation was sent by ${senderName}</p>
                            <p>Aadat - Build Better Habits Together</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${toEmail}. Message ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
        
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = {
    sendInvitationEmail
};
