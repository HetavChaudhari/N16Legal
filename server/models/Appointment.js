const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    guestName: { type: String },
    guestEmail: { type: String },
    guestPhone: { type: String },
    lawyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lawyer',
        required: true,
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
        enum: ['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'],
        default: 'Pending',
    },
    caseType: {
        type: String,
        required: true,
    },
    notes: {
        type: String,
    }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);
