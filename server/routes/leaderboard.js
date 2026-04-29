const express = require('express');
const router = express.Router();
const LeaderboardController = require('../controllers/LeaderboardController');
const auth = require('../middleware/auth');

router.get('/', auth, LeaderboardController.getTopUsers);

module.exports = router;
