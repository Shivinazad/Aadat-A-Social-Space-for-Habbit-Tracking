# Aadat - Social Habit Tracker 🎯

> Build habits that actually stick. A modern social platform for habit tracking, accountability, and community support.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🌟 Features

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
- MySQL (for local development)
- PostgreSQL (for Render deployment)

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/aadat-app.git
cd aadat-app
```

2. **Set up the database**
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE aadat_db;
exit
```

3. **Configure environment variables**
```bash
cd server
cp .env.example .env
# Edit .env with your database password
```

4. **Install dependencies and seed database**
```bash
# Install server dependencies
cd server
npm install

# Seed achievements
npm run seed

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
│   ├── models/           # Sequelize models
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
├── RENDER_DEPLOYMENT.md # Render deployment guide
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
- **Sequelize** - ORM
- **MySQL/PostgreSQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email invitations

## 🌐 Deployment

### Deploy to Render (Free)

Complete step-by-step guide available in [`RENDER_DEPLOYMENT.md`](./RENDER_DEPLOYMENT.md)

Quick summary:
1. Push code to GitHub
2. Create PostgreSQL database on Render
3. Create Web Service connected to your repo
4. Set environment variables
5. Deploy! 🚀

Build Command:
```bash
cd client-react && npm install && npm run build && cd ../server && npm install
```

Start Command:
```bash
cd server && npm start
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
DATABASE_URL=<postgres-url>        # For production
DB_NAME=aadat_db                   # For local MySQL
DB_USER=root                       # For local MySQL
DB_PASSWORD=your_password          # For local MySQL
DB_HOST=localhost                  # For local MySQL
JWT_SECRET=your_secret_key
NODE_ENV=production
PORT=3000
CLIENT_URL=https://your-app.onrender.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
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

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **Your Name** - Initial work

## 🙏 Acknowledgments

- Inspired by habit tracking apps like Habitica, Streaks, and Done
- Design inspiration from modern SaaS landing pages
- Community features inspired by social platforms

## 📧 Support

For support, email your.email@example.com or create an issue in the repository.

---

**Built with ❤️ for people who want to build better habits**
