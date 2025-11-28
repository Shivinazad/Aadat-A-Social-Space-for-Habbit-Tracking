// Test email configuration
// Run this with: node test-email.js
require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('\n🧪 Testing Email Configuration...\n');

// Check if credentials are set
const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD;

console.log('📧 EMAIL_USER:', emailUser);
console.log('🔑 EMAIL_PASSWORD:', emailPassword ? '✅ Set (hidden)' : '❌ Not set');

if (!emailUser || emailUser === 'your-email@gmail.com') {
    console.log('\n❌ ERROR: EMAIL_USER not configured!');
    console.log('👉 Please update server/.env with your real Gmail address');
    process.exit(1);
}

if (!emailPassword || emailPassword === 'your-gmail-app-password' || emailPassword === 'your_gmail_app_password') {
    console.log('\n❌ ERROR: EMAIL_PASSWORD not configured!');
    console.log('👉 Please generate a Gmail App Password');
    console.log('📖 See EMAIL_SETUP_GUIDE.md for instructions');
    process.exit(1);
}

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailUser,
        pass: emailPassword
    }
});

// Test connection
console.log('\n🔄 Testing connection to Gmail...\n');

transporter.verify(function(error, success) {
    if (error) {
        console.log('❌ Connection FAILED!');
        console.log('Error:', error.message);
        console.log('\n📖 Common issues:');
        console.log('   • Not using App Password (using regular password)');
        console.log('   • 2-Factor Authentication not enabled');
        console.log('   • App Password has spaces (remove them!)');
        console.log('   • Wrong email or password');
        console.log('\n👉 See EMAIL_SETUP_GUIDE.md for help');
    } else {
        console.log('✅ Connection SUCCESSFUL!');
        console.log('✨ Your email service is ready to send invitations!');
        console.log('\n🚀 Next steps:');
        console.log('   1. Start your server: node index.js');
        console.log('   2. Go to Dashboard');
        console.log('   3. Try sending an invite!');
    }
    process.exit(error ? 1 : 0);
});
