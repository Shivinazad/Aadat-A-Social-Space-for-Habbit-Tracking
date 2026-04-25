# Aadat - Social Habit Tracker 🎯

> Build habits that actually stick. A modern social platform for habit tracking, accountability, and community support.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🌟 Features

- **🤖 AI-Powered Roadmaps** - Gemini AI generates personalized 30-day habit-building paths
- **📊 Habit Tracking** - Track daily habits and build streaks
- **🔥 Streak System** - Visual feedback for consistency
- **👥 Community Feed** - Share progress and support others
- **🏆 Leaderboard** - Compete with friends on XP
- **🎖️ Achievements** - Unlock badges as you progress
- **📧 Invite Friends** - Build accountability with friends
- **⚡ Real-time Updates** - See community activity instantly
- **📱 Responsive Design** - Works on desktop and mobile

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas or local MongoDB

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/aadat-app.git
cd aadat-app
```

2. **Set up the database**
```bash
# Create a MongoDB Atlas cluster or start local MongoDB
```

3. **Configure environment variables**
```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and app secrets
```

4. **Install dependencies and start backend**
```bash
# Install server dependencies
cd server
npm install

# Start backend (Terminal 1)
npm run dev
```

5. **Start frontend**
```bash
# In a new terminal (Terminal 2)
cd client-react
npm install
npm run dev
```

6. **Open the app**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## 📦 Project Structure

```
aadat-app/
├── client/               # Original vanilla JS client (legacy)
├── client-react/         # React frontend (current)
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── context/      # Auth context
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service layer
│   │   └── assets/       # Images and static files
│   ├── package.json
│   └── vite.config.js
├── server/               # Express backend
│   ├── models/           # Legacy Sequelize models kept during transition
│   ├── models-mongo/     # MongoDB/Mongoose models
│   │   ├── User.js
│   │   ├── Habit.js
│   │   ├── Post.js
│   │   ├── Achievement.js
│   │   └── ...
│   ├── middleware/       # Auth middleware
│   ├── db.js            # Database connection
│   ├── index.js         # Main server file
│   ├── seed.js          # Database seeding
│   └── package.json
├── DEPLOYMENT_PLAN.md   # Complete project plan
├── vercel.json          # Vercel deployment config
└── README.md            # This file
```

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Vite** - Build tool
- **CSS3** - Styling with custom properties

### Backend
- **Node.js** - Runtime
- **Express 5** - Web framework
- **MongoDB Atlas** - Production database
- **Mongoose** - MongoDB ODM
- **Sequelize** - Legacy ORM retained only for historical model files
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email invitations
- **Google Gemini AI** - Roadmap generation

## 🌐 Deployment

### Deploy to Vercel

Use MongoDB Atlas for the database and deploy the app through Vercel.

Quick summary:
1. Push code to GitHub
2. Create a MongoDB Atlas cluster
3. Set the server and client environment variables
4. Deploy the repository to Vercel
5. Verify `/health` and the `/api` routes

Build Command:
```bash
cd client-react && npm install && npm run build
```

Start Command:
```bash
node server/index.js
```

## 📚 API Documentation

### Authentication
- `POST /api/users/register` - Create new account
- `POST /api/users/login` - Login
- `GET /api/users/me` - Get current user

### Habits
- `GET /api/habits` - Get user's habits
- `POST /api/habits` - Create habit
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit

### Posts (Check-ins)
- `GET /api/posts` - Get community feed
- `POST /api/posts` - Create check-in
- `POST /api/posts/:id/like` - Like a post

### Achievements
- `GET /api/achievements` - Get all achievements with status
- `GET /api/users/me/achievements` - Get user's unlocked achievements

### Leaderboard
- `GET /api/leaderboard` - Get top 10 users by XP

### Notifications
- `GET /api/notifications` - Get user's notifications
- `PUT /api/notifications/mark-read` - Mark all as read
- `PUT /api/notifications/:id/read` - Mark one as read

## 🔒 Environment Variables

### Server (.env)
```env
MONGODB_URI=<mongo-atlas-uri>      # For MongoDB Atlas
DB_ENGINE=mongo                    # Use MongoDB migration path
JWT_SECRET=your_secret_key
NODE_ENV=production
PORT=3000
CLIENT_URL=https://your-app.vercel.app
GOOGLE_CALLBACK_URL=https://your-app.vercel.app/api/users/auth/google/callback
GITHUB_CALLBACK_URL=https://your-app.vercel.app/api/users/auth/github/callback
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
GEMINI_API_KEY=your_gemini_api_key
```

### Client (.env)
```env
VITE_API_BASE_URL=https://your-app.vercel.app
```

## 🧪 Testing

```bash
# Run backend
cd server
npm test

# Run frontend
cd client-react
npm test
```

## 📝 Future Features

- [ ] Analytics dashboard with charts
- [ ] Real-time notifications (WebSocket)
- [ ] Habit reminders
- [ ] Social features (follow users)
- [ ] Habit templates
- [ ] Data export (CSV/PDF)
- [ ] Mobile app (React Native)
- [ ] Dark/Light theme toggle

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 📧 Support

For support, email shivinazad3@gmail.com or create an issue in the repository.

---

**Built with ❤️ for people who want to build better habits**
