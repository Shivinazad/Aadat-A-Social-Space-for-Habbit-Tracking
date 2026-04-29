const express = require('express');
const router = express.Router();
const HabitController = require('../controllers/HabitController');
const auth = require('../middleware/auth');

router.get('/', auth, HabitController.getAll);
router.post('/', auth, HabitController.create);
router.put('/:id', auth, HabitController.update);
router.delete('/:id', auth, HabitController.delete);

module.exports = router;
