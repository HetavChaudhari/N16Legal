const express = require('express');
const router = express.Router();
const { getUserProfile, getLawyers } = require('../controllers/userController');
const { protect } = require('../middlewares/auth');

router.get('/profile', protect, getUserProfile);
router.get('/lawyers', getLawyers);

module.exports = router;
