const Appointment = require('../models/Appointment');
const Lawyer = require('../models/Lawyer');
const sendEmail = require('../utils/sendEmail');
const asyncHandler = require('../utils/asyncHandler');

const jwt = require('jsonwebtoken');

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Public
const createAppointment = asyncHandler(async (req, res) => {
    const { lawyerId, date, time, caseType, notes, name, email, phone } = req.body;

    if (!lawyerId || !date || !time || !caseType || !name || !email || !phone) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    let clientId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            clientId = decoded.id;
        } catch (error) {
            console.error('Token failed');
        }
    }

    const appointmentData = {
        guestName: name,
        guestEmail: email,
        guestPhone: phone,
        lawyer: lawyerId,
        date,
        time,
        caseType,
        notes,
    };

    if (clientId) {
        appointmentData.client = clientId;
    }

    const appointment = new Appointment(appointmentData);
    const createdAppointment = await appointment.save();
    res.status(201).json(createdAppointment);
});

// @desc    Get user appointments
// @route   GET /api/appointments
// @access  Private
const getAppointments = asyncHandler(async (req, res) => {
    let appointments;
    if (req.user.role === 'client') {
        appointments = await Appointment.find({ client: req.user._id }).populate({ path: 'lawyer', populate: { path: 'user', select: 'name email' } });
    } else if (req.user.role === 'lawyer') {
        const lawyerProfile = await Lawyer.findOne({ user: req.user._id });
        if (lawyerProfile) {
            appointments = await Appointment.find({ lawyer: lawyerProfile._id }).populate('client', 'name email phone');
        } else {
            appointments = [];
        }
    } else {
        appointments = await Appointment.find({}).populate('client', 'name email').populate('lawyer');
    }

    res.json(appointments);
});

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private (Lawyer/Admin)
const updateAppointmentStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    // Only lawyers and admins may change appointment status
    if (!req.user || !['lawyer', 'admin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Not authorized to update appointment status' });
    }

    const validStatuses = ['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'];
    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Please provide a valid status' });
    }

    const appointment = await Appointment.findById(req.params.id).populate('client', 'name email');

    if (appointment) {
        // A lawyer may only update their own appointments
        if (req.user.role === 'lawyer') {
            const lawyerProfile = await Lawyer.findOne({ user: req.user._id });
            if (!lawyerProfile || appointment.lawyer.toString() !== lawyerProfile._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to update this appointment' });
            }
        }

        appointment.status = status;
        const updatedAppointment = await appointment.save();

        if (status.toLowerCase() === 'approved' || status.toLowerCase() === 'rejected') {
            const emailTo = appointment.client ? appointment.client.email : appointment.guestEmail;
            const nameTo = appointment.client ? appointment.client.name : appointment.guestName;
            
            try {
                const subject = status.toLowerCase() === 'approved' ? 'Appointment Booked Successfully - N16Legal' : 'Appointment Rejected - N16Legal';
                const messageText = status.toLowerCase() === 'approved' 
                    ? `Hello ${nameTo},\n\nGreat news! Your appointment scheduled for ${new Date(appointment.date).toDateString()} at ${appointment.time} has been approved and booked successfully.\n\nThank you,\nN16Legal Team`
                    : `Hello ${nameTo},\n\nUnfortunately, your appointment scheduled for ${new Date(appointment.date).toDateString()} at ${appointment.time} has been rejected.\n\nThank you,\nN16Legal Team`;

                await sendEmail({
                    email: emailTo,
                    subject: subject,
                    message: messageText
                });
            } catch (error) {
                console.error('Email could not be sent', error);
            }
        }

        res.json(updatedAppointment);
    } else {
        res.status(404).json({ message: 'Appointment not found' });
    }
});

module.exports = {
    createAppointment,
    getAppointments,
    updateAppointmentStatus,
};
