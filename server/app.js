const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware
app.use(express.json({ limit: '100kb' }));
// In production set CLIENT_URL to restrict cross-origin requests to the frontend
app.use(cors({ origin: process.env.CLIENT_URL || true }));
app.use(helmet());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100, // 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const otpRoutes = require('./routes/otpRoutes');
const receptionistRoutes = require('./routes/receptionistRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Basic route for testing
app.get('/', (req, res) => {
    res.send('N16Legal API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/receptionist', receptionistRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler for unknown API routes
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Global error handler (catches errors passed by asyncHandler)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    // Mongoose validation / cast errors and explicit statusCodes are client errors
    const statusCode = err.statusCode
        || ((err.name === 'ValidationError' || err.name === 'CastError') ? 400 : 500);
    if (statusCode >= 500) console.error(err.stack);
    res.status(statusCode).json({
        message: statusCode < 500 ? err.message : 'Server Error',
    });
});

module.exports = app;
