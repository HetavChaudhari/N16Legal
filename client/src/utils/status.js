// Shared appointment status helpers

export const STATUSES = {
    PENDING: 'Pending',
    RECEPTIONIST_APPROVED: 'Receptionist Approved',
    WAITING_LAWYER: 'Waiting Lawyer Confirmation',
    CONFIRMED: 'Confirmed',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    REJECTED: 'Rejected',
};

// Terminal statuses cannot be changed any further
export const TERMINAL_STATUSES = [STATUSES.COMPLETED, STATUSES.CANCELLED, STATUSES.REJECTED];

// CSS-safe slug for status badge classes, e.g. "Waiting Lawyer Confirmation" -> "waiting-lawyer-confirmation"
export const statusSlug = (status = '') => status.toLowerCase().replace(/\s+/g, '-');

export const isTerminal = (status) => TERMINAL_STATUSES.includes(status);

export const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
