const Appointment = require('../models/Appointment');
const { APPOINTMENT_STATUSES } = require('../models/Appointment');
const Lawyer = require('../models/Lawyer');
const asyncHandler = require('../utils/asyncHandler');
const sendEmail = require('../utils/sendEmail');
const notify = require('../utils/notify');

const APPOINTMENT_POPULATE = [
    { path: 'client', select: 'name email phone' },
    { path: 'lawyer', populate: { path: 'user', select: 'name email' } },
    { path: 'handledBy', select: 'name' },
    { path: 'internalNotes.addedBy', select: 'name' },
    { path: 'statusHistory.changedBy', select: 'name role' },
];

// Small helpers -------------------------------------------------------------

const findAppointmentOr404 = async (id, res) => {
    const appointment = await Appointment.findById(id).populate(APPOINTMENT_POPULATE);
    if (!appointment) {
        res.status(404).json({ message: 'Appointment not found' });
        return null;
    }
    return appointment;
};

const clientContact = (appointment) => ({
    email: appointment.client ? appointment.client.email : appointment.guestEmail,
    name: appointment.client ? appointment.client.name : appointment.guestName,
});

const sendClientEmail = async (appointment, subject, message) => {
    const { email } = clientContact(appointment);
    if (!email) return;
    try {
        await sendEmail({ email, subject, message });
    } catch (error) {
        console.error('Email could not be sent:', error.message);
    }
};

const formatDate = (appointment) =>
    `${new Date(appointment.date).toDateString()} at ${appointment.time}`;

// Controllers ---------------------------------------------------------------

// @desc    List appointments (optionally filtered by status)
// @route   GET /api/receptionist/appointments?status=Pending
// @access  Private (Receptionist/Admin)
const getAppointments = asyncHandler(async (req, res) => {
    const { status } = req.query;
    const filter = {};
    if (status) {
        if (!APPOINTMENT_STATUSES.includes(status)) {
            return res.status(400).json({ message: 'Invalid status filter' });
        }
        filter.status = status;
    }
    const appointments = await Appointment.find(filter)
        .populate(APPOINTMENT_POPULATE)
        .sort({ createdAt: -1 });
    res.json(appointments);
});

// @desc    Get single appointment with full details/history
// @route   GET /api/receptionist/appointments/:id
// @access  Private (Receptionist/Admin)
const getAppointmentById = asyncHandler(async (req, res) => {
    const appointment = await findAppointmentOr404(req.params.id, res);
    if (!appointment) return;
    res.json(appointment);
});

// @desc    Approve a pending appointment request
// @route   PUT /api/receptionist/appointments/:id/approve
// @access  Private (Receptionist/Admin)
const approveAppointment = asyncHandler(async (req, res) => {
    const appointment = await findAppointmentOr404(req.params.id, res);
    if (!appointment) return;

    appointment.transitionTo('Receptionist Approved', req.user._id);
    appointment.handledBy = req.user._id;
    await appointment.save();

    const { name } = clientContact(appointment);
    await sendClientEmail(
        appointment,
        'Appointment Request Approved - N16Legal',
        `Hello ${name},\n\nYour appointment request for ${formatDate(appointment)} has been approved by our reception team. We will assign a lawyer to your case shortly.\n\nThank you,\nN16Legal Team`
    );
    await notify(appointment.client?._id, 'Appointment Approved', `Your appointment request for ${formatDate(appointment)} was approved by reception.`);

    res.json(appointment);
});

// @desc    Reject a pending appointment request
// @route   PUT /api/receptionist/appointments/:id/reject
// @access  Private (Receptionist/Admin)
const rejectAppointment = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
        return res.status(400).json({ message: 'A rejection reason is required' });
    }

    const appointment = await findAppointmentOr404(req.params.id, res);
    if (!appointment) return;

    appointment.transitionTo('Rejected', req.user._id, reason.trim());
    appointment.rejectionReason = reason.trim();
    appointment.handledBy = req.user._id;
    await appointment.save();

    const { name } = clientContact(appointment);
    await sendClientEmail(
        appointment,
        'Appointment Request Rejected - N16Legal',
        `Hello ${name},\n\nUnfortunately, your appointment request for ${formatDate(appointment)} was rejected.\nReason: ${reason.trim()}\n\nYou are welcome to submit a new request.\n\nThank you,\nN16Legal Team`
    );
    await notify(appointment.client?._id, 'Appointment Rejected', `Your appointment request for ${formatDate(appointment)} was rejected. Reason: ${reason.trim()}`);

    res.json(appointment);
});

// @desc    Assign a lawyer to an approved appointment
// @route   PUT /api/receptionist/appointments/:id/assign-lawyer
// @access  Private (Receptionist/Admin)
const assignLawyer = asyncHandler(async (req, res) => {
    const { lawyerId } = req.body;
    if (!lawyerId) {
        return res.status(400).json({ message: 'lawyerId is required' });
    }

    const lawyerProfile = await Lawyer.findById(lawyerId).populate('user', 'name email');
    if (!lawyerProfile) {
        return res.status(404).json({ message: 'Lawyer not found' });
    }

    const appointment = await findAppointmentOr404(req.params.id, res);
    if (!appointment) return;

    appointment.transitionTo('Waiting Lawyer Confirmation', req.user._id, `Assigned to ${lawyerProfile.user?.name || 'lawyer'}`);
    appointment.lawyer = lawyerProfile._id;
    appointment.handledBy = req.user._id;
    await appointment.save();
    await appointment.populate(APPOINTMENT_POPULATE);

    await notify(lawyerProfile.user?._id, 'New Appointment Assigned', `An appointment on ${formatDate(appointment)} (${appointment.caseType}) is waiting for your confirmation.`);
    await notify(appointment.client?._id, 'Lawyer Assigned', `${lawyerProfile.user?.name || 'A lawyer'} has been assigned to your appointment on ${formatDate(appointment)}. Waiting for lawyer confirmation.`);

    res.json(appointment);
});

// @desc    Add an internal note to an appointment
// @route   POST /api/receptionist/appointments/:id/notes
// @access  Private (Receptionist/Admin)
const addNote = asyncHandler(async (req, res) => {
    const { text } = req.body;
    if (!text || !text.trim()) {
        return res.status(400).json({ message: 'Note text is required' });
    }
    if (text.trim().length > 1000) {
        return res.status(400).json({ message: 'Note must be under 1000 characters' });
    }

    const appointment = await findAppointmentOr404(req.params.id, res);
    if (!appointment) return;

    appointment.internalNotes.push({ text: text.trim(), addedBy: req.user._id });
    await appointment.save();
    await appointment.populate(APPOINTMENT_POPULATE);

    res.status(201).json(appointment);
});

// @desc    Reschedule an appointment
// @route   PUT /api/receptionist/appointments/:id/reschedule
// @access  Private (Receptionist/Admin)
const rescheduleAppointment = asyncHandler(async (req, res) => {
    const { date, time } = req.body;
    if (!date || !time) {
        return res.status(400).json({ message: 'Both date and time are required' });
    }
    const newDate = new Date(date);
    if (Number.isNaN(newDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date' });
    }
    if (newDate < new Date(new Date().toDateString())) {
        return res.status(400).json({ message: 'Cannot reschedule to a past date' });
    }
    if (!/^\d{1,2}:\d{2}(\s?(AM|PM))?$/i.test(time.trim())) {
        return res.status(400).json({ message: 'Invalid time format' });
    }

    const appointment = await findAppointmentOr404(req.params.id, res);
    if (!appointment) return;

    if (['Completed', 'Cancelled', 'Rejected'].includes(appointment.status)) {
        return res.status(400).json({ message: `Cannot reschedule a ${appointment.status.toLowerCase()} appointment` });
    }

    const oldSchedule = formatDate(appointment);
    appointment.date = newDate;
    appointment.time = time.trim();

    // A confirmed appointment needs the lawyer to re-confirm the new slot
    if (appointment.status === 'Confirmed') {
        appointment.transitionTo('Waiting Lawyer Confirmation', req.user._id, 'Rescheduled - awaiting lawyer re-confirmation');
    } else {
        appointment.statusHistory.push({
            status: appointment.status,
            changedBy: req.user._id,
            reason: `Rescheduled from ${oldSchedule} to ${formatDate(appointment)}`,
        });
    }
    await appointment.save();

    const { name } = clientContact(appointment);
    await sendClientEmail(
        appointment,
        'Appointment Rescheduled - N16Legal',
        `Hello ${name},\n\nYour appointment has been rescheduled from ${oldSchedule} to ${formatDate(appointment)}.\n\nThank you,\nN16Legal Team`
    );
    await notify(appointment.client?._id, 'Appointment Rescheduled', `Your appointment was moved to ${formatDate(appointment)}.`);
    if (appointment.lawyer?.user?._id) {
        await notify(appointment.lawyer.user._id, 'Appointment Rescheduled', `An assigned appointment was moved to ${formatDate(appointment)}.`);
    }

    res.json(appointment);
});

// @desc    Cancel an appointment
// @route   PUT /api/receptionist/appointments/:id/cancel
// @access  Private (Receptionist/Admin)
const cancelAppointment = asyncHandler(async (req, res) => {
    const { reason } = req.body;

    const appointment = await findAppointmentOr404(req.params.id, res);
    if (!appointment) return;

    appointment.transitionTo('Cancelled', req.user._id, reason?.trim());
    if (reason?.trim()) appointment.rejectionReason = reason.trim();
    await appointment.save();

    const { name } = clientContact(appointment);
    await sendClientEmail(
        appointment,
        'Appointment Cancelled - N16Legal',
        `Hello ${name},\n\nYour appointment scheduled for ${formatDate(appointment)} has been cancelled.${reason?.trim() ? `\nReason: ${reason.trim()}` : ''}\n\nThank you,\nN16Legal Team`
    );
    await notify(appointment.client?._id, 'Appointment Cancelled', `Your appointment on ${formatDate(appointment)} was cancelled.`);
    if (appointment.lawyer?.user?._id) {
        await notify(appointment.lawyer.user._id, 'Appointment Cancelled', `An assigned appointment on ${formatDate(appointment)} was cancelled.`);
    }

    res.json(appointment);
});

// @desc    List verified lawyers (for the assign-lawyer dropdown)
// @route   GET /api/receptionist/lawyers
// @access  Private (Receptionist/Admin)
const getLawyers = asyncHandler(async (req, res) => {
    const lawyers = await Lawyer.find({ verified: true })
        .populate('user', 'name email')
        .select('specialization experience consultationFee user');
    res.json(lawyers);
});

module.exports = {
    getAppointments,
    getAppointmentById,
    approveAppointment,
    rejectAppointment,
    assignLawyer,
    addNote,
    rescheduleAppointment,
    cancelAppointment,
    getLawyers,
};
