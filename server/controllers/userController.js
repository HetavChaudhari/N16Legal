const User = require('../models/User');
const Lawyer = require('../models/Lawyer');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        let lawyerProfile = null;
        if (user.role === 'lawyer') {
            lawyerProfile = await Lawyer.findOne({ user: user._id });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            avatar: user.avatar,
            lawyerProfile
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// @desc    Get all lawyers (with filtering)
// @route   GET /api/users/lawyers
// @access  Public
const getLawyers = async (req, res) => {
    try {
        const query = { verified: true };

        if (req.query.specialization) {
            query.specialization = req.query.specialization;
        }

        if (req.query.keyword) {
            const users = await User.find({ 
                name: { $regex: req.query.keyword, $options: 'i' }, 
                role: 'lawyer' 
            });
            const userIds = users.map(u => u._id);

            query.$or = [
                { user: { $in: userIds } },
                { specialization: { $regex: req.query.keyword, $options: 'i' } }
            ];
        }

        const lawyers = await Lawyer.find(query).populate('user', 'name email avatar phone');
        res.json(lawyers);
    } catch (error) {
        console.error('Error fetching lawyers:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getUserProfile,
    getLawyers
};
