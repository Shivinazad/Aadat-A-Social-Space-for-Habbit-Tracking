const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');
const auth = require('../middleware/auth');

router.get('/', auth, NotificationController.getAll);
router.put('/mark-read', auth, NotificationController.markRead);

module.exports = router;
