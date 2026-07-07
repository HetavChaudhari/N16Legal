const jwt = require('jsonwebtoken');
const Appointment = require('../models/Appointment');
const Lawyer = require('../models/Lawyer');
const sendEmail = require('../utils/sendEmail');
const notify = require('../utils/notify');
const asyncHandler = require('../utils/asyncHandler');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIME_REGEX = /^\d{1,2}:\d{2}(\s?(AM|PM))?$/i;

// @desc    Create new appointment request (goes to receptionist review)
// @route   POST /api/appointments
// @access  Public
const createAppointment = asyncHandler(async (req, res) => {
    const { lawyerId, date, time, caseType, notes, name, email, phone } = req.body;

    if (!date || !time || !caseType || !name || !email || !phone) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }
    if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({ message: 'Please provide a valid email address' });
    }
    if (!TIME_REGEX.test(String(time).trim())) {
        return res.status(400).json({ message: 'Please provide a valid time' });
    }
    const requestedDate = new Date(date);
    if (Number.isNaN(requestedDate.getTime())) {
        return res.status(400).json({ message: 'Please provide a valid date' });
    }
    if (requestedDate < new Date(new Date().toDateString())) {
        return res.status(400).json({ message: 'Appointment date cannot be in the past' });
    }

    // Preferred lawyer is optional — the receptionist assigns/confirms one during review
    if (lawyerId) {
        const lawyerExists = await Lawyer.findById(lawyerId);
        if (!lawyerExists) {
            return res.status(400).json({ message: 'Selected lawyer does not exist' });
        }
    }

    let clientId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            clientId = decoded.id;
        } catch (error) {
            // Invalid token on a public route: treat as guest booking
        }
    }

    const appointment = new Appointment({
        guestName: name,
        guestEmail: email,
        guestPhone: phone,
        lawyer: lawyerId || undefined,
        client: clientId || undefined,
        date: requestedDate,
        time: String(time).trim(),
        caseType,
        notes,
        statusHistory: [{ status: 'Pending', changedBy: clientId || undefined, reason: 'Appointment requested' }],
    });

    const createdAppointment = await appointment.save();
    res.status(201).json(createdAppointment);
});

// @desc    Get user appointments (role-aware)
// @route   GET /api/appointments
// @access  Private
const getAppointments = asyncHandler(async (req, res) => {
    let appointments;
    if (req.user.role === 'client') {
        appointments = await Appointment.find({ client: req.user._id })
            .populate({ path: 'lawyer', populate: { path: 'user', select: 'name email' } })
            .sort({ createdAt: -1 });
    } else if (req.user.role === 'lawyer') {
        const lawyerProfile = await Lawyer.findOne({ user: req.user._id });
        appointments = lawyerProfile
            ? await Appointment.find({ lawyer: lawyerProfile._id })
                .populate('client', 'name email phone')
                .sort({ createdAt: -1 })
            : [];
    } else {
        // admin and receptionist see everything
        appointments = await Appointment.find({})
            .populate('client', 'name email')
            .populate({ path: 'lawyer', populate: { path: 'user', select: 'name email' } })
            .sort({ createdAt: -1 });
    }

    res.json(appointments);
});

// Which transitions each role may perform through this generic endpoint.
// Receptionists use their dedicated /api/receptionist routes.
const ROLE_TRANSITIONS = {
    lawyer: {
        'Waiting Lawyer Confirmation': ['Confirmed', 'Rejected'],
        'Confirmed': ['Completed'],
    },
};

// @desc    Update appointment status (lawyer confirmation / admin override)
// @route   PUT /api/appointments/:id/status
// @access  Private (Lawyer/Admin)
const updateAppointmentStatus = asyncHandler(async (req, res) => {
    const { status, reason } = req.body;

    if (!req.user || !['lawyer', 'admin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Not authorized to update appointment status' });
    }

    if (!status || !Appointment.APPOINTMENT_STATUSES.includes(status)) {
        return res.status(400).json({ message: 'Please provide a valid status' });
    }

    const appointment = await Appointment.findById(req.params.id).populate('client', 'name email');
    if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
    }

    if (req.user.role === 'lawyer') {
        // A lawyer may only update their own appointments...
        const lawyerProfile = await Lawyer.findOne({ user: req.user._id });
        if (!lawyerProfile || !appointment.lawyer || appointment.lawyer.toString() !== lawyerProfile._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this appointment' });
        }
        // ...and only via allowed workflow transitions
        const allowed = ROLE_TRANSITIONS.lawyer[appointment.status] || [];
        if (!allowed.includes(status)) {
            return res.status(400).json({ message: `Lawyers cannot change status from '${appointment.status}' to '${status}'` });
        }
    }

    appointment.transitionTo(status, req.user._id, reason);
    const updatedAppointment = await appointment.save();

    // Notify the client about confirmation / rejection outcomes
    if (['Confirmed', 'Rejected', 'Cancelled'].includes(status)) {
        const emailTo = appointment.client ? appointment.client.email : appointment.guestEmail;
        const nameTo = appointment.client ? appointment.client.name : appointment.guestName;
        const when = `${new Date(appointment.date).toDateString()} at ${appointment.time}`;

        const subjects = {
            Confirmed: 'Appointment Confirmed - N16Legal',
            Rejected: 'Appointment Rejected - N16Legal',
            Cancelled: 'Appointment Cancelled - N16Legal',
        };
        const messages = {
            Confirmed: `Hello ${nameTo},\n\nGreat news! Your appointment on ${when} has been confirmed by the lawyer.\n\nThank you,\nN16Legal Team`,
            Rejected: `Hello ${nameTo},\n\nUnfortunately, your appointment on ${when} has been rejected.${reason ? `\nReason: ${reason}` : ''}\n\nThank you,\nN16Legal Team`,
            Cancelled: `Hello ${nameTo},\n\nYour appointment on ${when} has been cancelled.${reason ? `\nReason: ${reason}` : ''}\n\nThank you,\nN16Legal Team`,
        };

        if (emailTo) {
            try {
                await sendEmail({ email: emailTo, subject: subjects[status], message: messages[status] });
            } catch (error) {
                console.error('Email could not be sent:', error.message);
            }
        }
        await notify(
            appointment.client?._id,
            subjects[status].replace(' - N16Legal', ''),
            `Your appointment on ${when} is now ${status.toLowerCase()}.`
        );
    }

    res.json(updatedAppointment);
});

module.exports = {
    createAppointment,
    getAppointments,
    updateAppointmentStatus,
};
