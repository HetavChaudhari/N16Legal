const express = require('express');
const router = express.Router();
const {
    getAppointments,
    getAppointmentById,
    approveAppointment,
    rejectAppointment,
    assignLawyer,
    addNote,
    rescheduleAppointment,
    cancelAppointment,
    getLawyers,
} = require('../controllers/receptionistController');
const { protect, receptionist } = require('../middlewares/auth');

// All receptionist routes require auth + receptionist (or admin) role
router.use(protect, receptionist);

router.get('/appointments', getAppointments);
router.get('/appointments/:id', getAppointmentById);
router.put('/appointments/:id/approve', approveAppointment);
router.put('/appointments/:id/reject', rejectAppointment);
router.put('/appointments/:id/assign-lawyer', assignLawyer);
router.post('/appointments/:id/notes', addNote);
router.put('/appointments/:id/reschedule', rescheduleAppointment);
router.put('/appointments/:id/cancel', cancelAppointment);
router.get('/lawyers', getLawyers);

module.exports = router;
