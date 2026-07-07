import React, { useContext, useEffect, useState, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/StatusBadge';
import NotificationBell from '../../components/NotificationBell';
import { STATUSES, isTerminal, formatDate } from '../../utils/status';
import '../../CSS/Dashboard.css';

const TABS = { PENDING: 'pending', ACTIVE: 'active', HISTORY: 'history' };

const ReceptionistDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);
    const [lawyers, setLawyers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState(TABS.PENDING);
    const [selected, setSelected] = useState(null); // appointment shown in details modal
    const [actionState, setActionState] = useState({}); // { type, lawyerId, reason, date, time, note }
    const [busy, setBusy] = useState(false);

    const fetchAll = useCallback(async () => {
        try {
            const [apptRes, lawyerRes] = await Promise.all([
                api.get('/receptionist/appointments'),
                api.get('/receptionist/lawyers'),
            ]);
            setAppointments(apptRes.data);
            setLawyers(lawyerRes.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const refreshSelected = (updated) => {
        setSelected(prev => (prev && prev._id === updated._id ? updated : prev));
    };

    const runAction = async (fn, successMsg) => {
        setBusy(true);
        try {
            const updated = await fn();
            toast.success(successMsg);
            setActionState({});
            if (updated) refreshSelected(updated);
            await fetchAll();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        } finally {
            setBusy(false);
        }
    };

    const approve = (id) => runAction(async () => {
        const res = await api.put(`/receptionist/appointments/${id}/approve`);
        return res.data;
    }, 'Request approved');

    const reject = (id) => {
        if (!actionState.reason?.trim()) return toast.error('Please provide a rejection reason');
        runAction(async () => {
            const res = await api.put(`/receptionist/appointments/${id}/reject`, { reason: actionState.reason });
            return res.data;
        }, 'Request rejected');
    };

    const assignLawyer = (id) => {
        if (!actionState.lawyerId) return toast.error('Please select a lawyer');
        runAction(async () => {
            const res = await api.put(`/receptionist/appointments/${id}/assign-lawyer`, { lawyerId: actionState.lawyerId });
            return res.data;
        }, 'Lawyer assigned — waiting for confirmation');
    };

    const reschedule = (id) => {
        if (!actionState.date || !actionState.time) return toast.error('Please pick a new date and time');
        runAction(async () => {
            const res = await api.put(`/receptionist/appointments/${id}/reschedule`, { date: actionState.date, time: actionState.time });
            return res.data;
        }, 'Appointment rescheduled');
    };

    const cancel = (id) => {
        runAction(async () => {
            const res = await api.put(`/receptionist/appointments/${id}/cancel`, { reason: actionState.reason });
            return res.data;
        }, 'Appointment cancelled');
    };

    const addNote = (id) => {
        if (!actionState.note?.trim()) return toast.error('Please write a note first');
        runAction(async () => {
            const res = await api.post(`/receptionist/appointments/${id}/notes`, { text: actionState.note });
            return res.data;
        }, 'Note added');
    };

    // Derived views ----------------------------------------------------------
    const pending = appointments.filter(a => a.status === STATUSES.PENDING);
    const active = appointments.filter(a => !isTerminal(a.status) && a.status !== STATUSES.PENDING);
    const history = appointments.filter(a => isTerminal(a.status));
    const awaitingLawyer = appointments.filter(a => a.status === STATUSES.WAITING_LAWYER).length;
    const confirmedCount = appointments.filter(a => a.status === STATUSES.CONFIRMED).length;

    const visible = tab === TABS.PENDING ? pending : tab === TABS.ACTIVE ? active : history;

    const clientName = (a) => a.client?.name || a.guestName || 'Guest';
    const lawyerName = (a) => a.lawyer?.user?.name ? `Adv. ${a.lawyer.user.name}` : '—';

    const openAction = (appt, type) => {
        setSelected(appt);
        setActionState({ type });
    };

    // Rendering --------------------------------------------------------------
    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>🗂 Receptionist Dashboard</h1>
                <div className="header-actions">
                    <NotificationBell />
                    <button className="btn-outline" onClick={logout}>Logout</button>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-label">Pending Requests</div>
                    <div className="stat-value">{pending.length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">👨‍⚖️</div>
                    <div className="stat-label">Awaiting Lawyer</div>
                    <div className="stat-value">{awaitingLawyer}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-label">Confirmed</div>
                    <div className="stat-value">{confirmedCount}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📁</div>
                    <div className="stat-label">Total</div>
                    <div className="stat-value">{appointments.length}</div>
                </div>
            </div>

            <div className="dashboard-card" style={{ marginBottom: '1.5rem' }}>
                <div className="profile-row">
                    <span className="profile-label">Signed in as</span>
                    <span className="profile-value">{user?.name} (Receptionist)</span>
                </div>
            </div>

            <div className="dashboard-card">
                <div className="tab-bar" role="tablist">
                    <button role="tab" aria-selected={tab === TABS.PENDING} className={`tab-btn ${tab === TABS.PENDING ? 'active' : ''}`} onClick={() => setTab(TABS.PENDING)}>
                        Pending Requests ({pending.length})
                    </button>
                    <button role="tab" aria-selected={tab === TABS.ACTIVE} className={`tab-btn ${tab === TABS.ACTIVE ? 'active' : ''}`} onClick={() => setTab(TABS.ACTIVE)}>
                        In Progress ({active.length})
                    </button>
                    <button role="tab" aria-selected={tab === TABS.HISTORY} className={`tab-btn ${tab === TABS.HISTORY ? 'active' : ''}`} onClick={() => setTab(TABS.HISTORY)}>
                        History ({history.length})
                    </button>
                </div>

                {loading ? (
                    <div className="empty-state"><p>Loading appointments…</p></div>
                ) : visible.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <p>{tab === TABS.PENDING ? 'No pending requests. All caught up!' : 'Nothing here yet.'}</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date &amp; Time</th>
                                    <th>Client</th>
                                    <th>Case Type</th>
                                    <th>Lawyer</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map((app) => (
                                    <tr key={app._id}>
                                        <td>
                                            <strong>{formatDate(app.date)}</strong>
                                            <br />
                                            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{app.time}</span>
                                        </td>
                                        <td>{clientName(app)}</td>
                                        <td>{app.caseType}</td>
                                        <td>{lawyerName(app)}</td>
                                        <td><StatusBadge status={app.status} /></td>
                                        <td>
                                            <div className="action-row">
                                                {app.status === STATUSES.PENDING && (
                                                    <>
                                                        <button className="action-btn action-btn-approve" disabled={busy} onClick={() => approve(app._id)}>✓ Approve</button>
                                                        <button className="action-btn action-btn-reject" disabled={busy} onClick={() => openAction(app, 'reject')}>✕ Reject</button>
                                                    </>
                                                )}
                                                {app.status === STATUSES.RECEPTIONIST_APPROVED && (
                                                    <button className="action-btn action-btn-approve" disabled={busy} onClick={() => openAction(app, 'assign')}>👨‍⚖️ Assign Lawyer</button>
                                                )}
                                                {!isTerminal(app.status) && (
                                                    <>
                                                        <button className="action-btn" disabled={busy} onClick={() => openAction(app, 'reschedule')}>🗓 Reschedule</button>
                                                        <button className="action-btn action-btn-reject" disabled={busy} onClick={() => openAction(app, 'cancel')}>Cancel</button>
                                                    </>
                                                )}
                                                <button className="action-btn" onClick={() => openAction(app, 'details')}>Details</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Details / action modal */}
            {selected && (
                <div className="modal-overlay" onClick={() => { setSelected(null); setActionState({}); }}>
                    <div className="modal-box" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Appointment Details</h3>
                            <button className="link-btn" aria-label="Close" onClick={() => { setSelected(null); setActionState({}); }}>✕</button>
                        </div>

                        <div className="modal-body">
                            <div className="profile-row"><span className="profile-label">Client</span><span className="profile-value">{clientName(selected)}</span></div>
                            <div className="profile-row"><span className="profile-label">Contact</span><span className="profile-value">{selected.client?.email || selected.guestEmail} · {selected.client?.phone || selected.guestPhone}</span></div>
                            <div className="profile-row"><span className="profile-label">Schedule</span><span className="profile-value">{formatDate(selected.date)} at {selected.time}</span></div>
                            <div className="profile-row"><span className="profile-label">Case Type</span><span className="profile-value">{selected.caseType}</span></div>
                            <div className="profile-row"><span className="profile-label">Lawyer</span><span className="profile-value">{lawyerName(selected)}</span></div>
                            <div className="profile-row"><span className="profile-label">Status</span><StatusBadge status={selected.status} /></div>
                            {selected.notes && <div className="profile-row"><span className="profile-label">Client Notes</span><span className="profile-value">{selected.notes}</span></div>}
                            {selected.rejectionReason && <div className="profile-row"><span className="profile-label">Reason</span><span className="profile-value">{selected.rejectionReason}</span></div>}

                            {/* Action forms */}
                            {actionState.type === 'reject' && (
                                <div className="modal-action-form">
                                    <label htmlFor="reject-reason">Rejection reason</label>
                                    <input id="reject-reason" type="text" placeholder="Why is this request being rejected?" value={actionState.reason || ''} onChange={(e) => setActionState({ ...actionState, reason: e.target.value })} />
                                    <button className="action-btn action-btn-reject" disabled={busy} onClick={() => reject(selected._id)}>Confirm Rejection</button>
                                </div>
                            )}

                            {actionState.type === 'assign' && (
                                <div className="modal-action-form">
                                    <label htmlFor="assign-lawyer">Assign a lawyer</label>
                                    <select id="assign-lawyer" value={actionState.lawyerId || ''} onChange={(e) => setActionState({ ...actionState, lawyerId: e.target.value })}>
                                        <option value="">— Select lawyer —</option>
                                        {lawyers.map(l => (
                                            <option key={l._id} value={l._id}>
                                                Adv. {l.user?.name} · {l.specialization?.join(', ') || 'General'} ({l.experience} yrs)
                                            </option>
                                        ))}
                                    </select>
                                    <button className="action-btn action-btn-approve" disabled={busy} onClick={() => assignLawyer(selected._id)}>Assign &amp; Request Confirmation</button>
                                </div>
                            )}

                            {actionState.type === 'reschedule' && (
                                <div className="modal-action-form">
                                    <label htmlFor="resched-date">New date &amp; time</label>
                                    <input id="resched-date" type="date" min={new Date().toISOString().split('T')[0]} value={actionState.date || ''} onChange={(e) => setActionState({ ...actionState, date: e.target.value })} />
                                    <input id="resched-time" aria-label="New time" type="time" value={actionState.time || ''} onChange={(e) => setActionState({ ...actionState, time: e.target.value })} />
                                    <button className="action-btn action-btn-approve" disabled={busy} onClick={() => reschedule(selected._id)}>Reschedule</button>
                                </div>
                            )}

                            {actionState.type === 'cancel' && (
                                <div className="modal-action-form">
                                    <label htmlFor="cancel-reason">Cancellation reason (optional)</label>
                                    <input id="cancel-reason" type="text" placeholder="Reason for cancelling" value={actionState.reason || ''} onChange={(e) => setActionState({ ...actionState, reason: e.target.value })} />
                                    <button className="action-btn action-btn-reject" disabled={busy} onClick={() => cancel(selected._id)}>Confirm Cancellation</button>
                                </div>
                            )}

                            {/* Internal notes */}
                            <div className="modal-section">
                                <h4>Internal Notes</h4>
                                {(selected.internalNotes?.length || 0) === 0
                                    ? <p className="muted">No internal notes yet.</p>
                                    : (
                                        <ul className="note-list">
                                            {selected.internalNotes.map((n, i) => (
                                                <li key={n._id || i}>
                                                    <p>{n.text}</p>
                                                    <small>{n.addedBy?.name || 'Staff'} · {new Date(n.createdAt).toLocaleString()}</small>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                <div className="modal-action-form">
                                    <input type="text" aria-label="New internal note" placeholder="Add an internal note…" value={actionState.note || ''} onChange={(e) => setActionState({ ...actionState, note: e.target.value })} />
                                    <button className="action-btn" disabled={busy} onClick={() => addNote(selected._id)}>Add Note</button>
                                </div>
                            </div>

                            {/* Status history */}
                            {(selected.statusHistory?.length || 0) > 0 && (
                                <div className="modal-section">
                                    <h4>Status History</h4>
                                    <ul className="note-list">
                                        {[...selected.statusHistory].reverse().map((h, i) => (
                                            <li key={h._id || i}>
                                                <p><StatusBadge status={h.status} />{h.reason ? ` — ${h.reason}` : ''}</p>
                                                <small>{h.changedBy?.name ? `${h.changedBy.name} · ` : ''}{new Date(h.changedAt).toLocaleString()}</small>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReceptionistDashboard;
