const express = require('express');
const router = express.Router();
const { getStats, getAllUsers, getAllLawyers, verifyLawyer, createLawyer } = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/auth');

router.use(protect, admin);

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.get('/lawyers', getAllLawyers);
router.post('/lawyers', createLawyer);
router.put('/lawyers/:id/verify', verifyLawyer);

module.exports = router;
