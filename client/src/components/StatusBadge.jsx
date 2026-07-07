import React from 'react';
import { statusSlug } from '../utils/status';

const StatusBadge = ({ status }) => (
    <span className={`status-badge status-${statusSlug(status)}`}>{status}</span>
);

export default StatusBadge;
