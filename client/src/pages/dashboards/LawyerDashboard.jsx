import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import '../../CSS/Dashboard.css';

const LawyerDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await api.get('/appointments');
            setAppointments(res.data);
        } catch (error) {
            toast.error('Failed to load appointments');
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/appointments/${id}/status`, { status });
            toast.success(`Appointment ${status.toLowerCase()}!`);
            fetchAppointments();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const pendingCount = appointments.filter(a => a.status === 'Pending').length;
    const approvedCount = appointments.filter(a => a.status === 'Approved').length;
    const completedCount = appointments.filter(a => a.status === 'Completed').length;

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <h1>⚖ Lawyer Dashboard</h1>
                <div className="header-actions">
                    <button className="btn-outline" onClick={logout}>Logout</button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-label">Pending</div>
                    <div className="stat-value">{pendingCount}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✓</div>
                    <div className="stat-label">Approved</div>
                    <div className="stat-value">{approvedCount}</div>
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
                                                <span className={`status-badge status-${app.status.toLowerCase()}`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td>
                                                {app.status === 'Pending' && (
                                                    <>
                                                        <button className="action-btn action-btn-approve" onClick={() => updateStatus(app._id, 'Approved')}>✓ Approve</button>
                                                        <button className="action-btn action-btn-reject" onClick={() => updateStatus(app._id, 'Rejected')}>✕ Reject</button>
                                                    </>
                                                )}
                                                {app.status === 'Approved' && (
                                                    <button className="action-btn action-btn-complete" onClick={() => updateStatus(app._id, 'Completed')}>✔ Mark Done</button>
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
