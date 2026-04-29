const express = require('express');
const router = express.Router();
const AchievementController = require('../controllers/AchievementController');
const auth = require('../middleware/auth');

router.get('/', auth, AchievementController.getAll);

module.exports = router;
