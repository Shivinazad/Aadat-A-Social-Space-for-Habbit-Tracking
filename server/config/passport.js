const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const bcrypt = require('bcrypt');
const { UserMongo } = require('../models-mongo');

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await UserMongo.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/users/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;
        let user = await UserMongo.findOne({ email });

        if (user) {
            return done(null, user);
        } else {
            const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            
            user = await UserMongo.create({
                username: profile.displayName || email.split('@')[0],
                email,
                password: hashedPassword,
                avatar: profile.photos[0]?.value || null
            });
            return done(null, user);
        }
    } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, null);
    }
}));

// GitHub OAuth Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/api/users/auth/github/callback',
    scope: ['user:email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails && profile.emails.length > 0 
            ? profile.emails.find(e => e.primary)?.value || profile.emails[0].value
            : `${profile.username}@github.com`;

        let user = await UserMongo.findOne({ email });

        if (user) {
            return done(null, user);
        } else {
            const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            
            user = await UserMongo.create({
                username: profile.username || profile.displayName || email.split('@')[0],
                email: email,
                password: hashedPassword,
                avatar: profile.photos[0]?.value || profile._json.avatar_url || null
            });
            return done(null, user);
        }
    } catch (error) {
        console.error('GitHub OAuth error:', error);
        return done(error, null);
    }
}));

module.exports = passport;
