const OTP = require('../models/OTP');
const sendEmail = require('../utils/sendEmail');
const asyncHandler = require('../utils/asyncHandler');

// Generate 6 digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Send OTP to email or phone
// @route   POST /api/otp/send
// @access  Public
const sendOtp = asyncHandler(async (req, res) => {
    let { contact, type } = req.body; // type is 'email' or 'phone'

    if (!contact || !type) {
        return res.status(400).json({ message: 'Please provide contact and type' });
    }

    contact = contact.trim().toLowerCase();
    const otpCode = generateOTP();

    // Remove any existing OTP for this contact
    await OTP.deleteMany({ contact });

    // Save new OTP
    await OTP.create({
        contact,
        otp: otpCode,
    });

    try {
        if (type === 'email') {
            await sendEmail({
                email: contact,
                subject: 'Your N16Legal Verification Code',
                message: `Your verification code is: ${otpCode}. It will expire in 5 minutes.`,
            });
            console.log(`[Email Mock] OTP sent to ${contact}: ${otpCode}`);
            res.status(200).json({ message: `OTP sent successfully to ${contact}` });
        } else if (type === 'phone') {
            // Mocking SMS since no Twilio credentials are provided
            console.log(`[SMS Mock] OTP sent to phone ${contact}: ${otpCode}`);
            // Return OTP in response so development can proceed without real SMS provider
            res.status(200).json({ 
                message: `OTP sent successfully to ${contact}`, 
                devOtp: otpCode 
            });
        } else {
            return res.status(400).json({ message: 'Invalid type. Use email or phone.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to send OTP' });
    }
});

// @desc    Verify OTP
// @route   POST /api/otp/verify
// @access  Public
const verifyOtp = asyncHandler(async (req, res) => {
    let { contact, otp } = req.body;

    if (!contact || !otp) {
        return res.status(400).json({ message: 'Please provide contact and OTP' });
    }

    contact = contact.trim().toLowerCase();
    otp = otp.trim();

    const existingOtp = await OTP.findOne({ contact, otp });

    if (existingOtp) {
        // OTP matched, optionally delete it so it can't be reused
        await OTP.deleteOne({ _id: existingOtp._id });
        res.status(200).json({ message: 'OTP verified successfully', verified: true });
    } else {
        res.status(400).json({ message: 'Invalid or expired OTP', verified: false });
    }
});

module.exports = {
    sendOtp,
    verifyOtp,
};
