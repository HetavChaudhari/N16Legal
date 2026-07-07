const express = require('express');
const router = express.Router();
const { createReview, getLawyerReviews } = require('../controllers/reviewController');
const { protect } = require('../middlewares/auth');

router.route('/')
    .post(protect, createReview);

router.route('/:lawyerId')
    .get(getLawyerReviews);

module.exports = router;
