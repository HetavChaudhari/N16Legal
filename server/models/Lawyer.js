const mongoose = require('mongoose');

const LawyerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    specialization: {
        type: [String],
        required: true,
    },
    experience: {
        type: Number, // In years
        required: true,
    },
    education: {
        type: String,
        required: true,
    },
    languages: {
        type: [String],
        default: ['English'],
    },
    consultationFee: {
        type: Number,
        required: true,
    },
    rating: {
        type: Number,
        default: 0,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    availability: {
        type: [String], // Array of available time slots
    },
    bio: {
        type: String,
    },
    officeAddress: {
        type: String,
    }
}, { timestamps: true });

module.exports = mongoose.model('Lawyer', LawyerSchema);
