const User = require('../models/User');
const Lawyer = require('../models/Lawyer');
const Appointment = require('../models/Appointment');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getStats = asyncHandler(async (req, res) => {
    const usersCount = await User.countDocuments({ role: 'client' });
    const lawyersCount = await Lawyer.countDocuments();
    const appointmentsCount = await Appointment.countDocuments();

    res.json({
        usersCount,
        lawyersCount,
        appointmentsCount
    });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({ role: 'client' }).select('-password');
    res.json(users);
});

// @desc    Get all lawyers (including unverified)
// @route   GET /api/admin/lawyers
// @access  Private (Admin)
const getAllLawyers = asyncHandler(async (req, res) => {
    const lawyers = await Lawyer.find({}).populate('user', 'name email status');
    res.json(lawyers);
});

// @desc    Verify a lawyer
// @route   PUT /api/admin/lawyers/:id/verify
// @access  Private (Admin)
const verifyLawyer = asyncHandler(async (req, res) => {
    const lawyer = await Lawyer.findById(req.params.id);
    if (lawyer) {
        lawyer.verified = true;
        await lawyer.save();
        res.json({ message: 'Lawyer verified successfully' });
    } else {
        res.status(404).json({ message: 'Lawyer not found' });
    }
});

// @desc    Create a new lawyer
// @route   POST /api/admin/lawyers
// @access  Private (Admin)
const createLawyer = asyncHandler(async (req, res) => {
    const { name, email, password, phone, specialization, experience, education, consultationFee } = req.body;

    if (!name || !email || !password || !specialization || !experience || !education || !consultationFee) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({
        name,
        email,
        password,
        role: 'lawyer',
        phone
    });

    if (user) {
        const lawyer = await Lawyer.create({
            user: user._id,
            // Accept both "A, B" strings (from the admin form) and arrays
            specialization: Array.isArray(specialization)
                ? specialization
                : specialization.split(',').map(s => s.trim()),
            experience,
            education,
            consultationFee,
            verified: true // Admin-created lawyers are auto-verified
        });

        res.status(201).json({
            _id: lawyer._id,
            name: user.name,
            email: user.email,
            verified: lawyer.verified
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
});

module.exports = {
    getStats,
    getAllUsers,
    getAllLawyers,
    verifyLawyer,
    createLawyer
};
