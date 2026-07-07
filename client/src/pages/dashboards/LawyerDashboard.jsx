import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/StatusBadge';
import NotificationBell from '../../components/NotificationBell';
import { STATUSES } from '../../utils/status';
import '../../CSS/Dashboard.css';

const LawyerDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);

    const fetchAppointments = async () => {
        try {
            const res = await api.get('/appointments');
            setAppointments(res.data);
        } catch (error) {
            toast.error('Failed to load appointments');
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const updateStatus = async (id, status, reason) => {
        try {
            await api.put(`/appointments/${id}/status`, { status, reason });
            toast.success(`Appointment ${status.toLowerCase()}!`);
            fetchAppointments();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const declineAppointment = (id) => {
        const reason = window.prompt('Reason for declining this appointment (optional):') || undefined;
        updateStatus(id, STATUSES.REJECTED, reason);
    };

    const awaitingCount = appointments.filter(a => a.status === STATUSES.WAITING_LAWYER).length;
    const confirmedCount = appointments.filter(a => a.status === STATUSES.CONFIRMED).length;
    const completedCount = appointments.filter(a => a.status === STATUSES.COMPLETED).length;

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <h1>⚖ Lawyer Dashboard</h1>
                <div className="header-actions">
                    <NotificationBell />
                    <button className="btn-outline" onClick={logout}>Logout</button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-label">Awaiting Confirmation</div>
                    <div className="stat-value">{awaitingCount}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✓</div>
                    <div className="stat-label">Confirmed</div>
                    <div className="stat-value">{confirmedCount}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✔</div>
                    <div className="stat-label">Completed</div>
                    <div className="stat-value">{completedCount}</div>
                </div>
            </div>

            {/* Profile Card */}
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h3><span className="card-icon">👤</span> My Profile</h3>
                    <div className="profile-row">
                        <span className="profile-label">Name</span>
                        <span className="profile-value">{user?.name}</span>
                    </div>
                    <div className="profile-row">
                        <span className="profile-label">Email</span>
                        <span className="profile-value">{user?.email}</span>
                    </div>
                    {user?.lawyerProfile && (
                        <>
                            <div className="profile-row">
                                <span className="profile-label">Specialization</span>
                                <span className="profile-value">{user.lawyerProfile.specialization?.join(', ')}</span>
                            </div>
                            <div className="profile-row">
                                <span className="profile-label">Consultation Fee</span>
                                <span className="profile-value">₹{user.lawyerProfile.consultationFee}</span>
                            </div>
                            <div className="profile-row">
                                <span className="profile-label">Rating</span>
                                <span className="profile-value">{'★'.repeat(Math.round(user.lawyerProfile.rating))}{'☆'.repeat(5 - Math.round(user.lawyerProfile.rating))} {user.lawyerProfile.rating}/5</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Appointment Requests */}
                <div className="dashboard-card">
                    <div className="section-title">
                        <h3><span className="card-icon">📋</span> Appointment Requests</h3>
                        <span className="badge-count">{appointments.length} Total</span>
                    </div>
                    {appointments.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📭</div>
                            <p>No appointment requests yet.</p>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Date & Time</th>
                                        <th>Client</th>
                                        <th>Case Type</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.map((app) => (
                                        <tr key={app._id}>
                                            <td>
                                                <strong>{new Date(app.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                                                <br />
                                                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{app.time}</span>
                                            </td>
                                            <td>{app.client?.name || app.guestName}</td>
                                            <td>{app.caseType}</td>
                                            <td>
                                                <StatusBadge status={app.status} />
                                            </td>
                                            <td>
                                                {app.status === STATUSES.WAITING_LAWYER && (
                                                    <>
                                                        <button className="action-btn action-btn-approve" onClick={() => updateStatus(app._id, STATUSES.CONFIRMED)}>✓ Confirm</button>
                                                        <button className="action-btn action-btn-reject" onClick={() => declineAppointment(app._id)}>✕ Decline</button>
                                                    </>
                                                )}
                                                {app.status === STATUSES.CONFIRMED && (
                                                    <button className="action-btn action-btn-complete" onClick={() => updateStatus(app._id, STATUSES.COMPLETED)}>✔ Mark Done</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LawyerDashboard;
