const Review = require('../models/Review');
const Lawyer = require('../models/Lawyer');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (Client)
const createReview = asyncHandler(async (req, res) => {
    const { lawyerId, rating, comment } = req.body;

    if (!lawyerId || !rating || !comment) {
        return res.status(400).json({ message: 'Please provide all fields' });
    }

    const lawyerExists = await Lawyer.findById(lawyerId);
    if (!lawyerExists) {
        return res.status(404).json({ message: 'Lawyer not found' });
    }

    const review = new Review({
        user: req.user._id,
        lawyer: lawyerId,
        rating: Number(rating),
        comment
    });

    const createdReview = await review.save();

    // Update lawyer's average rating
    const reviews = await Review.find({ lawyer: lawyerId });
    const numReviews = reviews.length;
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;

    await Lawyer.findByIdAndUpdate(lawyerId, { rating: avgRating });

    res.status(201).json(createdReview);
});

// @desc    Get reviews for a lawyer
// @route   GET /api/reviews/:lawyerId
// @access  Public
const getLawyerReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ lawyer: req.params.lawyerId }).populate('user', 'name avatar');
    res.json(reviews);
});

module.exports = {
    createReview,
    getLawyerReviews
};
