# Deployment to Render - Step by Step Guide

## Prerequisites
- GitHub account
- Render account (free tier works)
- Code pushed to GitHub repository

---

## Step 1: Push Code to GitHub

```bash
# Navigate to project root
cd c:\coding\Aadat-A-Social-Space-for-Habbit-Tracking

# Initialize git (if not already done)
git init

# Create .gitignore
echo node_modules/ >> .gitignore
echo .env >> .gitignore
echo dist/ >> .gitignore

# Add all files
git add .

# Commit
git commit -m "Ready for Render deployment"

# Create GitHub repo (via GitHub website)
# Then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/aadat-app.git
git branch -M main
git push -u origin main
```

---

## Step 2: Create PostgreSQL Database on Render

1. Go to https://dashboard.render.com/
2. Click **New +** → **PostgreSQL**
3. Settings:
   - **Name:** `aadat-db`
   - **Database:** `aadat_db` (auto-filled)
   - **User:** `aadat_db_user` (auto-filled)
   - **Region:** Choose closest to you
   - **Plan:** Free
4. Click **Create Database**
5. Wait for database to provision (~2 minutes)
6. **Copy the Internal Database URL** (looks like: `postgresql://...`)

---

## Step 3: Create Web Service on Render

1. Go to https://dashboard.render.com/
2. Click **New +** → **Web Service**
3. **Connect Repository:**
   - Click **Connect Account** (GitHub)
   - Select your `aadat-app` repository
4. **Configure Service:**
   - **Name:** `aadat-app`
   - **Region:** Same as database
   - **Branch:** `main`
   - **Root Directory:** (leave blank)
   - **Runtime:** `Node`
   - **Build Command:** 
     ```bash
     cd client-react && npm install && npm run build && cd ../server && npm install
     ```
   - **Start Command:**
     ```bash
     cd server && npm start
     ```
   - **Plan:** Free

5. **Environment Variables:**
   Click **Advanced** → **Add Environment Variable**
   
   Add these variables:
   ```
   DATABASE_URL = <paste-internal-database-url-from-step-2>
   JWT_SECRET = your_super_secret_jwt_key_change_this_12345
   NODE_ENV = production
   CLIENT_URL = https://aadat-app.onrender.com
   GEMINI_API_KEY = AIzaSyBhxToLV029D32UUM4CKAQsnBoRwMrJNp8
   ```
   
   Optional (for email features):
   ```
   EMAIL_USER = your_email@gmail.com
   EMAIL_PASSWORD = your_gmail_app_password
   ```

6. Click **Create Web Service**

---

## Step 4: Wait for Deployment

- First deployment takes ~5-10 minutes
- Watch the logs in real-time
- Look for these success messages:
  ```
  Successfully connected to the PostgreSQL database! ✅
  All models were synchronized successfully.
  Server is running on http://localhost:10000
  📦 Serving React build from /dist
  ```

---

## Step 5: Seed Database with Achievements

Once deployment is successful:

1. In Render Dashboard, click on your **aadat-app** service
2. Go to **Shell** tab (top right)
3. Run:
   ```bash
   cd server
   node seed.js
   ```
4. You should see:
   ```
   ✅ Database connection established
   ✅ Database models synchronized
   ✅ Created: First Steps
   ✅ Created: 3-Day Streak
   ...
   🎉 Seeding completed successfully!
   ```

---

## Step 6: Test Your Deployed App

1. Visit: `https://aadat-app.onrender.com`
2. Test the following:
   - [ ] Homepage loads
   - [ ] Sign up works
   - [ ] Log in works
   - [ ] Can create a habit
   - [ ] **Can generate AI roadmap** (click "🤖 Generate AI Roadmap")
   - [ ] **View roadmap page** (/roadmap)
   - [ ] **Complete checkpoints** in roadmap
   - [ ] Can check in to a habit
   - [ ] Community feed shows posts
   - [ ] Leaderboard displays
   - [ ] Profile page loads
   - [ ] Can invite a friend (if email configured)

---

## AI Features Included 🤖

Your app now has powerful AI capabilities powered by Google Gemini:

### 1. AI-Powered Habit Roadmaps
- Click "Add Habit" and fill in the form
- Click "🤖 Generate AI Roadmap" button
- AI analyzes your goal and creates a personalized 6-checkpoint roadmap
- Roadmaps include: milestones, action steps, resources, and tips
- View and track progress on dedicated `/roadmap` page

### 2. Background AI Jobs (Automatic)
- **Daily Inactivity Emails (9 AM):** Sends funny reminders if users haven't logged in
- **Goal Analysis Emails (10 AM):** AI analyzes habit performance and sends personalized insights

### 3. Smart AI Prompts
- AI respects user's current skill level (beginner/intermediate/advanced)
- Provides specific resources with time estimates
- Creates achievable milestones at Days 1, 5, 10, 15, 20, 25

**Note:** The `GEMINI_API_KEY` is already included in the environment variables above.

---

## Troubleshooting

### Build Failed
- Check the build logs in Render dashboard
- Common issues:
  - Missing dependencies: run `npm install` locally to verify
  - Build command typo: verify the exact command
  - Node version mismatch: specify node version in `package.json`

### Database Connection Failed
- Verify `DATABASE_URL` is set correctly
- Make sure you copied the **Internal** database URL (not External)
- Check if database is in same region as web service

### App Shows "Cannot GET /"
- Build command didn't complete successfully
- `dist/` folder not created
- Check if `npm run build` works locally

### API Calls Fail (CORS errors)
- Verify `CLIENT_URL` environment variable is correct
- Make sure it matches your actual Render URL
- Check CORS configuration in `server/index.js`

### Slow First Load (Free Tier)
- Render free tier spins down after 15 minutes of inactivity
- First request takes ~30 seconds to wake up
- Subsequent requests are fast
- Upgrade to paid plan ($7/month) for always-on service

---

## Important Notes

### Free Tier Limitations
- ⏰ Service spins down after 15 min inactivity
- 🐌 First request after spin-down: ~30 seconds
- 📊 750 hours/month free (enough for hobby projects)
- 💾 Shared PostgreSQL (slower performance)

### Production Best Practices
- ✅ Never commit `.env` files
- ✅ Use strong JWT_SECRET (min 32 characters)
- ✅ Enable GitHub auto-deploy for continuous deployment
- ✅ Monitor logs for errors
- ✅ Set up health checks (already done: `/health`)

### Email Configuration (Optional)
To enable invitation emails:
1. Use Gmail with App Password
2. Enable 2FA on your Google account
3. Generate App Password: https://myaccount.google.com/apppasswords
4. Add `EMAIL_USER` and `EMAIL_PASSWORD` to environment variables

---

## Next Steps After Deployment

1. **Custom Domain (Optional):**
   - Go to Settings → Custom Domain
   - Add your domain (requires paid plan)

2. **Monitoring:**
   - Set up email alerts for service failures
   - Monitor error logs regularly

3. **Backups:**
   - Render automatically backs up PostgreSQL
   - Consider periodic manual exports

4. **Updates:**
   - Push to GitHub `main` branch
   - Render auto-deploys (if enabled)
   - Or manually deploy from Render dashboard

---

## Success! 🎉

Your Aadat app is now live at:
**https://aadat-app.onrender.com**

Share it with friends and start building better habits together!
