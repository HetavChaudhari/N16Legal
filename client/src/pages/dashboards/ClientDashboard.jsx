import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/StatusBadge';
import NotificationBell from '../../components/NotificationBell';
import { STATUSES, isTerminal } from '../../utils/status';
import '../../CSS/Dashboard.css';

const ClientDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);
    const [reviewingId, setReviewingId] = useState(null);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

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

    const submitReview = async (lawyerId) => {
        try {
            await api.post('/reviews', { lawyerId, rating: reviewData.rating, comment: reviewData.comment });
            toast.success('Review submitted successfully!');
            setReviewingId(null);
            setReviewData({ rating: 5, comment: '' });
        } catch (error) {
            toast.error('Failed to submit review');
        }
    };

    const pendingCount = appointments.filter(a => !isTerminal(a.status) && a.status !== STATUSES.CONFIRMED).length;
    const completedCount = appointments.filter(a => a.status === STATUSES.COMPLETED).length;
    const activeCount = appointments.filter(a => a.status === STATUSES.CONFIRMED).length;

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <h1>⚖ Client Dashboard</h1>
                <div className="header-actions">
                    <NotificationBell />
                    <button className="btn-outline" onClick={logout}>Logout</button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📅</div>
                    <div className="stat-label">Active Cases</div>
                    <div className="stat-value">{activeCount}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-label">Pending Requests</div>
                    <div className="stat-value">{pendingCount}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✔</div>
                    <div className="stat-label">Completed</div>
                    <div className="stat-value">{completedCount}</div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="dashboard-grid">
                {/* Profile Card */}
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
                    <div className="profile-row">
                        <span className="profile-label">Account Type</span>
                        <span className="profile-value" style={{textTransform: 'capitalize'}}>{user?.role}</span>
                    </div>
                </div>

                {/* Appointments Table */}
                <div className="dashboard-card">
                    <div className="section-title">
                        <h3><span className="card-icon">📋</span> My Appointments</h3>
                        <span className="badge-count">{appointments.length} Total</span>
                    </div>
                    
                    <div className="table-wrapper">
                        {appointments.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📅</div>
                                <p>You have no appointments yet. Head to the booking page to schedule one.</p>
                            </div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Date & Time</th>
                                        <th>Lawyer</th>
                                        <th>Case Type</th>
                                        <th>Status</th>
                                        <th>Action</th>
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
                                            <td>{app.lawyer?.user?.name || 'To be assigned'}</td>
                                            <td>{app.caseType}</td>
                                            <td>
                                                <StatusBadge status={app.status} />
                                            </td>
                                            <td>
                                                {app.status === STATUSES.COMPLETED && app.lawyer && reviewingId !== app._id && (
                                                    <button className="action-btn action-btn-verify" onClick={() => setReviewingId(app._id)}>★ Leave Review</button>
                                                )}
                                                {reviewingId === app._id && (
                                                    <div style={{display:'flex', flexDirection:'column', gap:'8px', marginTop:'8px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px'}}>
                                                        <select 
                                                            value={reviewData.rating} 
                                                            onChange={(e) => setReviewData({...reviewData, rating: e.target.value})}
                                                            style={{
                                                                width: '100%', padding: '8px', borderRadius: '6px', 
                                                                background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)'
                                                            }}
                                                        >
                                                            <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                                                            <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                                                            <option value="3">⭐⭐⭐ 3 Stars</option>
                                                            <option value="2">⭐⭐ 2 Stars</option>
                                                            <option value="1">⭐ 1 Star</option>
                                                        </select>
                                                        <input 
                                                            type="text" 
                                                            placeholder="Write a comment..." 
                                                            value={reviewData.comment} 
                                                            onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                                                            style={{
                                                                width: '100%', padding: '8px', borderRadius: '6px', 
                                                                background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)'
                                                            }}
                                                        />
                                                        <div style={{display:'flex', gap:'8px'}}>
                                                            <button className="action-btn action-btn-approve" onClick={() => submitReview(app.lawyer._id)}>Submit</button>
                                                            <button className="action-btn action-btn-reject" onClick={() => setReviewingId(null)}>Cancel</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;
