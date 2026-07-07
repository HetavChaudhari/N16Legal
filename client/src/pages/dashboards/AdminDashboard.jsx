import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import '../../CSS/Dashboard.css';

const AdminDashboard = () => {
    const { logout } = useContext(AuthContext);
    const [stats, setStats] = useState({ usersCount: 0, lawyersCount: 0, appointmentsCount: 0 });
    const [lawyers, setLawyers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newLawyer, setNewLawyer] = useState({
        name: '', email: '', password: '', phone: '', specialization: '', experience: '', education: '', consultationFee: ''
    });

    const fetchData = async () => {
        try {
            const [statsRes, lawyersRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/lawyers')
            ]);
            setStats(statsRes.data);
            setLawyers(lawyersRes.data);
        } catch (error) {
            toast.error('Failed to load admin data');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const verifyLawyer = async (id) => {
        try {
            await api.put(`/admin/lawyers/${id}/verify`);
            toast.success('Lawyer verified successfully!');
            fetchData();
        } catch (error) {
            toast.error('Failed to verify lawyer');
        }
    };

    const handleAddLawyer = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/lawyers', newLawyer);
            toast.success('Lawyer added successfully!');
            setShowModal(false);
            setNewLawyer({ name: '', email: '', password: '', phone: '', specialization: '', experience: '', education: '', consultationFee: '' });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add lawyer');
        }
    };

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <h1>⚖ Admin Dashboard</h1>
                <div className="header-actions">
                    <button className="btn-gold" onClick={() => setShowModal(true)}>＋ Add Lawyer</button>
                    <button className="btn-outline" onClick={logout}>Logout</button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-label">Total Clients</div>
                    <div className="stat-value">{stats.usersCount}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">⚖</div>
                    <div className="stat-label">Total Lawyers</div>
                    <div className="stat-value">{stats.lawyersCount}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📋</div>
                    <div className="stat-label">Appointments</div>
                    <div className="stat-value">{stats.appointmentsCount}</div>
                </div>
            </div>

            {/* Lawyer Management Table */}
            <div className="dashboard-card">
                <div className="section-title">
                    <h3><span className="card-icon">👨‍⚖️</span> Lawyer Management</h3>
                    <span className="badge-count">{lawyers.length} Total</span>
                </div>
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Verified</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lawyers.length === 0 ? (
                                <tr>
                                    <td colSpan="5">
                                        <div className="empty-state">
                                            <div className="empty-icon">👨‍⚖️</div>
                                            <p>No lawyers registered yet. Click "Add Lawyer" to get started.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                lawyers.map((lawyer) => (
                                    <tr key={lawyer._id}>
                                        <td><strong>{lawyer.user?.name}</strong></td>
                                        <td>{lawyer.user?.email}</td>
                                        <td>{lawyer.user?.status || '—'}</td>
                                        <td>
                                            <span className={`status-badge ${lawyer.verified ? 'status-approved' : 'status-rejected'}`}>
                                                {lawyer.verified ? 'Verified' : 'Unverified'}
                                            </span>
                                        </td>
                                        <td>
                                            {!lawyer.verified && (
                                                <button className="action-btn action-btn-verify" onClick={() => verifyLawyer(lawyer._id)}>
                                                    ✓ Verify
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Lawyer Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal-content dashboard-card">
                        <div className="modal-header">
                            <h2>＋ Add New Lawyer</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleAddLawyer} className="modal-form">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input type="text" placeholder="e.g., Adv. Ramesh Patel" required value={newLawyer.name} onChange={(e) => setNewLawyer({...newLawyer, name: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" placeholder="lawyer@n16legal.com" required value={newLawyer.email} onChange={(e) => setNewLawyer({...newLawyer, email: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input type="password" placeholder="••••••••" required value={newLawyer.password} onChange={(e) => setNewLawyer({...newLawyer, password: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input type="tel" placeholder="+91 XXXXX XXXXX" required value={newLawyer.phone} onChange={(e) => setNewLawyer({...newLawyer, phone: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Specialization</label>
                                <input type="text" placeholder="Criminal, Corporate, Family" required value={newLawyer.specialization} onChange={(e) => setNewLawyer({...newLawyer, specialization: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Experience (Years)</label>
                                <input type="number" placeholder="e.g., 12" required value={newLawyer.experience} onChange={(e) => setNewLawyer({...newLawyer, experience: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Education</label>
                                <input type="text" placeholder="e.g., NLU Ahmedabad" required value={newLawyer.education} onChange={(e) => setNewLawyer({...newLawyer, education: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Consultation Fee</label>
                                <input type="number" placeholder="₹ 2500" required value={newLawyer.consultationFee} onChange={(e) => setNewLawyer({...newLawyer, consultationFee: e.target.value})} />
                            </div>
                            <button type="submit">Create Lawyer Account</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
