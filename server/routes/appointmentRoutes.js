const express = require('express');
const router = express.Router();
const { createAppointment, getAppointments, updateAppointmentStatus } = require('../controllers/appointmentController');
const { protect } = require('../middlewares/auth');

router.route('/')
    .post(createAppointment)
    .get(protect, getAppointments);

router.route('/:id/status').put(protect, updateAppointmentStatus);

module.exports = router;
