const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const auth = require('../middleware/auth');
const passport = require('../config/passport');

// Auth routes
router.post('/register/send-otp', AuthController.sendOTP);
router.post('/register/verify-otp', AuthController.verifyOTP);
router.post('/login', AuthController.login);

// Profile routes
router.get('/profile', auth, AuthController.getProfile);
router.put('/profile', auth, AuthController.updateProfile);
router.get('/stats', auth, AuthController.getStats);
router.get('/stats/:id', auth, AuthController.getStats);

// OAuth (Keep these in routes as they are mostly config-driven)
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
    // ... OAuth success logic ...
});

module.exports = router;
