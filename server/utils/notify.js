const Notification = require('../models/Notification');

/**
 * Create an in-app notification. Failures are logged but never break the
 * main request flow (notifications are best-effort).
 */
const notify = async (recipientId, title, message) => {
    if (!recipientId) return;
    try {
        await Notification.create({ recipient: recipientId, title, message });
    } catch (error) {
        console.error('Failed to create notification:', error.message);
    }
};

module.exports = notify;
