import React, { useEffect, useRef, useState, useCallback } from 'react';
import api from '../services/api';

const POLL_INTERVAL_MS = 30000;

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const panelRef = useRef(null);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch {
            // Silent: notifications are non-critical
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Close panel on outside click
    useEffect(() => {
        const onClick = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    const unreadCount = notifications.filter(n => !n.readStatus).length;

    const markAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            fetchNotifications();
        } catch {
            // ignore
        }
    };

    const markRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            fetchNotifications();
        } catch {
            // ignore
        }
    };

    return (
        <div className="notification-bell" ref={panelRef}>
            <button
                className="bell-btn"
                onClick={() => setOpen(!open)}
                aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
            >
                🔔
                {unreadCount > 0 && <span className="bell-count">{unreadCount}</span>}
            </button>
            {open && (
                <div className="notification-panel">
                    <div className="notification-panel-header">
                        <strong>Notifications</strong>
                        {unreadCount > 0 && (
                            <button className="link-btn" onClick={markAllRead}>Mark all read</button>
                        )}
                    </div>
                    {notifications.length === 0 ? (
                        <p className="notification-empty">No notifications yet.</p>
                    ) : (
                        <ul className="notification-list">
                            {notifications.slice(0, 15).map(n => (
                                <li
                                    key={n._id}
                                    className={`notification-item ${n.readStatus ? '' : 'unread'}`}
                                    onClick={() => !n.readStatus && markRead(n._id)}
                                >
                                    <strong>{n.title}</strong>
                                    <p>{n.message}</p>
                                    <small>{new Date(n.createdAt).toLocaleString()}</small>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
