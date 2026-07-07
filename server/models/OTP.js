const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    contact: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300, // The document will be automatically deleted after 5 minutes (300 seconds)
    },
});

module.exports = mongoose.model('OTP', otpSchema);
