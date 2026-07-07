const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');

        // Token is valid but the user no longer exists
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        // Block suspended/inactive accounts even with a valid token
        if (req.user.status && req.user.status !== 'active') {
            return res.status(403).json({ message: 'Account is not active' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

// Generic role guard: authorize('admin', 'receptionist')
const authorize = (...roles) => (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
        return next();
    }
    return res.status(403).json({ message: `Not authorized. Requires role: ${roles.join(' or ')}` });
};

const admin = authorize('admin');
const lawyer = authorize('lawyer');
const receptionist = authorize('receptionist', 'admin');

module.exports = { protect, authorize, admin, lawyer, receptionist };
