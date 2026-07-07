const mongoose = require('mongoose');

// All statuses an appointment can be in, following the workflow:
// Client request -> Receptionist review -> Assign lawyer -> Lawyer confirmation -> Confirmed
const APPOINTMENT_STATUSES = [
    'Pending',
    'Receptionist Approved',
    'Waiting Lawyer Confirmation',
    'Confirmed',
    'Completed',
    'Cancelled',
    'Rejected',
];

// Allowed status transitions. Anything not listed here is invalid.
const STATUS_TRANSITIONS = {
    'Pending': ['Receptionist Approved', 'Rejected', 'Cancelled'],
    'Receptionist Approved': ['Waiting Lawyer Confirmation', 'Cancelled', 'Rejected'],
    'Waiting Lawyer Confirmation': ['Confirmed', 'Rejected', 'Cancelled', 'Waiting Lawyer Confirmation'],
    'Confirmed': ['Completed', 'Cancelled', 'Waiting Lawyer Confirmation'],
    'Completed': [],
    'Cancelled': [],
    'Rejected': [],
};

const AppointmentSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    guestName: { type: String, trim: true },
    guestEmail: { type: String, trim: true, lowercase: true },
    guestPhone: { type: String, trim: true },
    // Lawyer is optional at request time; the receptionist assigns one during review.
    lawyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lawyer',
        required: false,
    },
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: APPOINTMENT_STATUSES,
        default: 'Pending',
    },
    caseType: {
        type: String,
        required: true,
        trim: true,
    },
    notes: {
        type: String,
        trim: true,
    },
    // Internal notes added by receptionist/admin (not shown to clients)
    internalNotes: [{
        text: { type: String, required: true, trim: true },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        createdAt: { type: Date, default: Date.now },
    }],
    // Reason recorded when an appointment is rejected or cancelled
    rejectionReason: {
        type: String,
        trim: true,
    },
    // Receptionist who handled (approved/assigned) this request
    handledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    // Full audit trail of status changes
    statusHistory: [{
        status: { type: String, enum: APPOINTMENT_STATUSES, required: true },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: { type: String, trim: true },
        changedAt: { type: Date, default: Date.now },
    }],
}, { timestamps: true });

// Indexes for the most common queries
AppointmentSchema.index({ status: 1, date: 1 });
AppointmentSchema.index({ client: 1, createdAt: -1 });
AppointmentSchema.index({ lawyer: 1, date: 1 });

// Instance helper: validate + apply a status transition and record history
AppointmentSchema.methods.transitionTo = function (newStatus, changedBy, reason) {
    const allowed = STATUS_TRANSITIONS[this.status] || [];
    if (!allowed.includes(newStatus)) {
        const err = new Error(`Invalid status transition from '${this.status}' to '${newStatus}'`);
        err.statusCode = 400;
        throw err;
    }
    this.status = newStatus;
    this.statusHistory.push({
        status: newStatus,
        changedBy: changedBy || undefined,
        reason: reason || undefined,
    });
};

const Appointment = mongoose.model('Appointment', AppointmentSchema);

module.exports = Appointment;
module.exports.APPOINTMENT_STATUSES = APPOINTMENT_STATUSES;
module.exports.STATUS_TRANSITIONS = STATUS_TRANSITIONS;
