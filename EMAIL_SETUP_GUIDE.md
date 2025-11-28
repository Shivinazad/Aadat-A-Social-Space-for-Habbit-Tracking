# 📧 Email Setup Guide for Aadat Invitation Feature

This guide will help you enable email sending using Gmail and Nodemailer.

## ✅ Prerequisites

- A Gmail account
- 2-Factor Authentication enabled on your Gmail account

---

## 🔧 Step-by-Step Setup

### **Step 1: Enable 2-Factor Authentication**

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left sidebar
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the prompts to enable 2FA (if not already enabled)

### **Step 2: Generate App Password**

1. Go to: https://myaccount.google.com/apppasswords
2. You may need to sign in again
3. In the "Select app" dropdown, choose **Mail**
4. In the "Select device" dropdown, choose **Other (Custom name)**
5. Type: `Aadat Habit Tracker`
6. Click **Generate**
7. You'll see a 16-character password like: `abcd efgh ijkl mnop`
8. **Copy this password** (you won't be able to see it again!)

### **Step 3: Update Your .env File**

1. Open `server/.env` file
2. Replace the placeholder values:

```env
# Replace with YOUR Gmail address
EMAIL_USER=yourname@gmail.com

# Replace with the 16-character app password (no spaces!)
EMAIL_PASSWORD=abcdefghijklmnop
```

**Example:**
```env
EMAIL_USER=john.doe@gmail.com
EMAIL_PASSWORD=xyzw1234abcd5678
```

### **Step 4: Restart the Server**

```bash
cd server
node index.js
```

### **Step 5: Test the Invite Feature**

1. Go to Dashboard: http://localhost:5176
2. Scroll to "Invite Friends" section
3. Enter a test email (can be your own email)
4. Click "Send Invite"
5. Check your inbox!

---

## 🎯 Expected Results

**Success Message:**
```
✅ Invitation email sent from YourUsername to friend@email.com
Invitation sent to friend@email.com! 📧
```

**Email Received:**
- Beautiful HTML email with Aadat branding
- Personalized invitation from your username
- "Join Aadat Now" button
- List of features

---

## ❌ Troubleshooting

### Error: "Invalid login: Username and Password not accepted"

**Causes:**
- App password not generated correctly
- Using regular Gmail password instead of app password
- Spaces in the app password (remove all spaces!)
- 2FA not enabled

**Solution:**
1. Make sure 2FA is enabled
2. Generate a NEW app password
3. Copy it WITHOUT spaces
4. Update `.env` file
5. Restart server

### Error: "Email service unavailable"

**Causes:**
- `.env` file not loaded
- Credentials not set
- Gmail blocking the sign-in attempt

**Solution:**
1. Check that `.env` file exists in `server/` folder
2. Verify credentials are correct
3. Try generating a new app password
4. Check Gmail security settings

### Email Not Received

**Check:**
- Spam/Junk folder
- Email address typed correctly
- Gmail sending limits (500 emails/day for free accounts)

---

## 🔐 Security Notes

- **NEVER** commit your `.env` file to Git (it's in `.gitignore`)
- **NEVER** share your app password
- Use different app passwords for different applications
- Revoke app passwords you're not using

---

## 🚀 Production Deployment (Render)

When deploying to Render:

1. Go to your Render service → **Environment** tab
2. Add environment variables:
   - `EMAIL_USER` = your Gmail address
   - `EMAIL_PASSWORD` = your app password
3. Click **Save Changes**
4. Render will restart your service automatically

---

## 📚 Alternative Email Services

If you don't want to use Gmail, you can modify `server/emailService.js`:

### SendGrid
```javascript
const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
    }
});
```

### Mailgun
```javascript
const transporter = nodemailer.createTransport({
    host: 'smtp.mailgun.org',
    port: 587,
    auth: {
        user: process.env.MAILGUN_USER,
        pass: process.env.MAILGUN_PASSWORD
    }
});
```

### Amazon SES
```javascript
const transporter = nodemailer.createTransport({
    host: 'email-smtp.us-east-1.amazonaws.com',
    port: 587,
    auth: {
        user: process.env.AWS_SES_USER,
        pass: process.env.AWS_SES_PASSWORD
    }
});
```

---

## ✅ Current Status

- ✅ Nodemailer installed and configured
- ✅ Email service code ready
- ✅ Fallback to shareable links if email fails
- ⚠️ **Waiting for your Gmail credentials in `.env` file**

---

## 🎉 Once Configured

After you add real credentials:
1. Restart server
2. Send test invite
3. Check recipient's email
4. They click "Join Aadat Now"
5. They land on your app and sign up!

Perfect invitation flow! 🚀
