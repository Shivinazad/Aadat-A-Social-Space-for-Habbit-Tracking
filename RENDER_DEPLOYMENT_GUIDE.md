# Render Deployment Guide for Aadat

## ✅ Pre-Deployment Checklist

Your code is **RENDER-READY**! All necessary configurations are in place:

- ✅ Environment-based database configuration (PostgreSQL for production, MySQL for dev)
- ✅ Production build scripts
- ✅ Static file serving in production mode
- ✅ CORS configured for production domain
- ✅ Health check endpoint (`/health`)
- ✅ SSL/TLS support for PostgreSQL
- ✅ Proper routing for React SPA
- ✅ API proxy configuration
- ✅ Environment variable support

---

## 🚀 Deployment Options

### Option 1: Using render.yaml (Recommended - One Click Deploy)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Render deployment"
   git push origin main
   ```

2. **Deploy on Render**
   - Go to [render.com](https://render.com) and sign up/login
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml` and create:
     - PostgreSQL Database (Free tier)
     - Web Service with Node.js (Free tier)

3. **Set Required Environment Variables**
   
   Render will auto-generate some values. You need to manually add:
   
   ```
   DATABASE_URL          → Auto-filled by Render PostgreSQL
   GEMINI_API_KEY        → Your Google AI API key: AIzaSyBhxToLV029D32UUM4CKAQsnBoRwMrJNp8
   GOOGLE_CLIENT_ID      → (Optional) Your Google OAuth Client ID
   GOOGLE_CLIENT_SECRET  → (Optional) Your Google OAuth Secret
   GITHUB_CLIENT_ID      → (Optional) Your GitHub OAuth Client ID
   GITHUB_CLIENT_SECRET  → (Optional) Your GitHub OAuth Secret
   EMAIL_USER            → (Optional) Your email for notifications
   EMAIL_PASS            → (Optional) Your email app password
   ```

4. **Deploy!**
   - Render will automatically build and deploy
   - Build time: ~5-10 minutes
   - Your app will be live at: `https://aadat-app.onrender.com`

---

### Option 2: Manual Setup (If render.yaml doesn't work)

#### Step 1: Create PostgreSQL Database

1. Go to Render Dashboard → "New" → "PostgreSQL"
2. Name: `aadat-db`
3. Database: `aadat_db`
4. User: `aadat_user`
5. Region: Oregon (or closest to you)
6. Plan: Free
7. Click "Create Database"
8. **Copy the "Internal Database URL"** (you'll need this)

#### Step 2: Create Web Service

1. Go to Render Dashboard → "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `aadat-app`
   - **Region**: Oregon (same as database)
   - **Branch**: `main`
   - **Root Directory**: Leave blank
   - **Environment**: Node
   - **Build Command**:
     ```bash
     cd server && npm install && cd ../client-react && npm install && npm run build
     ```
   - **Start Command**:
     ```bash
     cd server && node index.js
     ```
   - **Plan**: Free

4. **Add Environment Variables**:
   Click "Advanced" → "Add Environment Variable"
   
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=[Paste the Internal Database URL from Step 1]
   JWT_SECRET=[Auto-generate or use: your-super-secret-jwt-key-change-this]
   SESSION_SECRET=[Auto-generate or use: your-session-secret-key-change-this]
   CLIENT_URL=https://aadat-app.onrender.com
   GEMINI_API_KEY=AIzaSyBhxToLV029D32UUM4CKAQsnBoRwMrJNp8
   
   # Optional OAuth (if you want Google/GitHub login)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=https://aadat-app.onrender.com/api/users/auth/google/callback
   
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   GITHUB_CALLBACK_URL=https://aadat-app.onrender.com/api/users/auth/github/callback
   
   # Optional Email (for AI notifications)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_specific_password
   ```

5. **Health Check Path**: `/health`

6. Click "Create Web Service"

---

## 🔧 Post-Deployment Setup

### 1. Verify Database Tables

After first deployment, Sequelize will automatically create all tables in PostgreSQL using `sequelize.sync({ alter: true })`.

Check logs to ensure:
```
✅ Successfully connected to the PostgreSQL database!
✅ All models were synchronized successfully. Sync mode: ALTER TABLE
✅ Server is running on http://localhost:3000
```

### 2. Update OAuth Callback URLs (If using OAuth)

#### Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to "APIs & Services" → "Credentials"
4. Edit your OAuth 2.0 Client
5. Add to "Authorized redirect URIs":
   ```
   https://aadat-app.onrender.com/api/users/auth/google/callback
   ```

#### GitHub OAuth:
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Edit your OAuth App
3. Update "Authorization callback URL":
   ```
   https://aadat-app.onrender.com/api/users/auth/github/callback
   ```

### 3. Test Your Deployment

Visit your app: `https://aadat-app.onrender.com`

Test these endpoints:
- ✅ Homepage loads: `https://aadat-app.onrender.com`
- ✅ Health check: `https://aadat-app.onrender.com/health`
- ✅ API: `https://aadat-app.onrender.com/api`

---

## 🐛 Troubleshooting

### Build Fails
- Check Render logs: Dashboard → Your Service → "Logs"
- Common issues:
  - Missing dependencies: Ensure `package.json` is correct
  - Build timeout: Render free tier has 15min build limit

### Database Connection Issues
- Verify `DATABASE_URL` environment variable
- Check database is in same region as web service
- Ensure SSL is enabled (already configured in `db.js`)

### 404 on Routes
- Ensure your web service is serving static files
- Check that `client-react/dist` folder exists after build
- Verify index.js has the production static file serving code (✅ Already configured)

### AI Roadmap Not Working
- Verify `GEMINI_API_KEY` is set correctly
- Check API quota: [Google AI Studio](https://aistudio.google.com/app/apikey)

### Free Tier Limitations
- **Spins Down**: Render free tier spins down after 15min inactivity
- **First Request Slow**: Takes ~30-60 seconds to spin up
- **Build Time**: Limited to 15 minutes
- **Database**: 1GB storage max

---

## 📊 Architecture on Render

```
┌─────────────────────────────────────────┐
│         Render Web Service              │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │   Node.js/Express Server         │  │
│  │   (Port 3000)                    │  │
│  │                                  │  │
│  │  - API Routes (/api/*)          │  │
│  │  - Static Files (React build)   │  │
│  │  - React Router (SPA)           │  │
│  └──────────────┬───────────────────┘  │
│                 │                       │
└─────────────────┼───────────────────────┘
                  │
                  ▼
         ┌────────────────┐
         │   PostgreSQL   │
         │   Database     │
         │   (Render)     │
         └────────────────┘
```

---

## 🔄 Continuous Deployment

Once set up, every push to `main` branch automatically:
1. Triggers new build on Render
2. Runs build commands
3. Deploys new version
4. Zero-downtime deployment

---

## 💡 Tips for Production

1. **Environment Variables**: Never commit `.env` files
2. **Database Backups**: Render free tier doesn't include automatic backups
3. **Monitoring**: Use Render's built-in logs and metrics
4. **Custom Domain**: You can add custom domain in Render settings
5. **Upgrade**: Consider paid plan ($7/month) for:
   - No spin down
   - Faster performance
   - More build minutes
   - SSL for custom domains

---

## ✅ Deployment Checklist

Before deploying:
- [ ] All code committed and pushed to GitHub
- [ ] Environment variables documented
- [ ] Database migration strategy planned
- [ ] OAuth callback URLs updated
- [ ] API keys secured in Render environment variables
- [ ] Health check endpoint tested locally
- [ ] Production build tested locally: `npm run build`
- [ ] CORS origins include production URL

After deploying:
- [ ] Health check returns 200: `/health`
- [ ] API responds: `/api`
- [ ] Database tables created (check logs)
- [ ] Frontend loads correctly
- [ ] Auth works (login/register)
- [ ] AI roadmap generation works
- [ ] OAuth login works (if configured)

---

## 🎯 Your Deployment is READY!

All code is compatible with Render. Just follow Option 1 for the easiest deployment!

**Current Status**: ✅ PRODUCTION READY

---

## 📞 Need Help?

- **Render Docs**: https://render.com/docs
- **Render Status**: https://status.render.com
- **Support**: support@render.com
