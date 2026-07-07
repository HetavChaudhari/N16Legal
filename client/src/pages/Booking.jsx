import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import '../CSS/index.css';
import '../CSS/Appointment.css';

const Booking = () => {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        caseType: 'Criminal Law',
        lawyerId: '',
        notes: ''
    });

    const [otpState, setOtpState] = useState({
        emailSent: false,
        phoneSent: false,
        emailVerified: false,
        phoneVerified: false,
        emailOtp: '',
        phoneOtp: ''
    });

    const [lawyers, setLawyers] = useState([]);

    useEffect(() => {
        const fetchLawyers = async () => {
            try {
                const res = await api.get('/users/lawyers');
                setLawyers(res.data);
                if (res.data.length > 0) {
                    setFormData(prev => ({ ...prev, lawyerId: res.data[0]._id }));
                }
            } catch (error) {
                console.error('Failed to fetch lawyers', error);
            }
        };
        fetchLawyers();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOtpChange = (e) => {
        setOtpState({ ...otpState, [e.target.name]: e.target.value });
    };

    const handleSendOtp = async (contact, type) => {
        if (!contact) return toast.error(`Please enter a valid ${type}`);
        try {
            const response = await api.post('/otp/send', { contact, type });
            toast.success(`OTP sent to ${contact}`);

            // For development: Show the mocked SMS OTP on the screen so you can test it
            if (response.data.devOtp) {
                toast(`[DEV ONLY] Your Phone OTP is: ${response.data.devOtp}`, { duration: 10000 });
            }

            setOtpState({ ...otpState, [`${type}Sent`]: true });
        } catch (error) {
            toast.error(`Failed to send OTP to ${type}`);
        }
    };

    const handleVerifyOtp = async (contact, otp, type) => {
        if (!otp) return toast.error('Please enter the OTP');
        try {
            const res = await api.post('/otp/verify', { contact, otp });
            if (res.data.verified) {
                setOtpState({ ...otpState, [`${type}Verified`]: true });
                toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} verified successfully!`);
            }
        } catch (error) {
            toast.error('Invalid or expired OTP');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!otpState.emailVerified || !otpState.phoneVerified) {
            toast.error('Please verify both your email and phone number before confirming the appointment.');
            return;
        }

        try {
            await api.post('/appointments', formData);
            toast.success('Appointment booked successfully!');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error booking appointment. Please try again.');
        }
    };

    return (
        <section className="form booking-container">
            <form id="appointment" onSubmit={handleSubmit}>
                <div className="title">
                    <h1>Schedule Appointment</h1>
                    <p>Book a confidential consultation with our legal experts.</p>
                </div>

                <div className="field">
                    <label htmlFor="name">Full Name</label>
                    <input type="text" id="name" name="name" placeholder="Enter your name" value={formData.name} onChange={handleChange} required />
                </div>

                <div className="field">
                    <label htmlFor="email">Email Address</label>
                    <div className="otp-input-group">
                        <input type="email" id="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} disabled={otpState.emailVerified} required />
                        {!otpState.emailVerified && (
                            <button type="button" className="btn-verify" onClick={() => handleSendOtp(formData.email, 'email')}>
                                {otpState.emailSent ? 'Resend OTP' : 'Send OTP'}
                            </button>
                        )}
                        {otpState.emailVerified && <span className="verified-badge">✓ Verified</span>}
                    </div>
                    {otpState.emailSent && !otpState.emailVerified && (
                        <div className="otp-verify-group">
                            <input type="text" name="emailOtp" placeholder="Enter Email OTP" value={otpState.emailOtp} onChange={handleOtpChange} />
                            <button type="button" className="btn-confirm" onClick={() => handleVerifyOtp(formData.email, otpState.emailOtp, 'email')}>Verify</button>
                        </div>
                    )}
                </div>

                <div className="field">
                    <label htmlFor="phone">Phone Number</label>
                    <div className="otp-input-group">
                        <input type="tel" id="phone" name="phone" placeholder="Enter your phone number" value={formData.phone} onChange={handleChange} disabled={otpState.phoneVerified} required />
                        {!otpState.phoneVerified && (
                            <button type="button" className="btn-verify" onClick={() => handleSendOtp(formData.phone, 'phone')}>
                                {otpState.phoneSent ? 'Resend OTP' : 'Send OTP'}
                            </button>
                        )}
                        {otpState.phoneVerified && <span className="verified-badge">✓ Verified</span>}
                    </div>
                    {otpState.phoneSent && !otpState.phoneVerified && (
                        <div className="otp-verify-group">
                            <input type="text" name="phoneOtp" placeholder="Enter Phone OTP" value={otpState.phoneOtp} onChange={handleOtpChange} />
                            <button type="button" className="btn-confirm" onClick={() => handleVerifyOtp(formData.phone, otpState.phoneOtp, 'phone')}>Verify</button>
                        </div>
                    )}
                </div>

                <div className="field">
                    <label htmlFor="date">Preferred Date</label>
                    <input type="date" id="date" name="date" min={new Date().toISOString().split('T')[0]} value={formData.date} onChange={handleChange} required />
                </div>

                <div className="field">
                    <label htmlFor="time">Preferred Time</label>
                    <input type="time" id="time" name="time" value={formData.time} onChange={handleChange} required />
                </div>

                <div className="field full">
                    <label htmlFor="caseType">Type of Case</label>
                    <select id="caseType" name="caseType" value={formData.caseType} onChange={handleChange}>
                        <option>Criminal Law</option>
                        <option>Civil Litigation</option>
                        <option>Corporate Law</option>
                        <option>Family & Divorce Law</option>
                        <option>Property & Real Estate</option>
                        <option>Legal Documentation</option>
                    </select>
                </div>

                <div className="field full">
                    <label htmlFor="lawyerId">Select Lawyer</label>
                    <select id="lawyerId" name="lawyerId" value={formData.lawyerId} onChange={handleChange}>
                        {lawyers.length === 0 && <option value="">Loading lawyers...</option>}
                        {lawyers.map(lawyer => (
                            <option key={lawyer._id} value={lawyer._id}>
                                Adv. {lawyer.user?.name} ({lawyer.specialization?.join(', ') || 'General'})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="field full">
                    <label htmlFor="notes">Address / Case Details</label>
                    <textarea id="notes" name="notes" rows="4" placeholder="Describe your case briefly..." value={formData.notes} onChange={handleChange}></textarea>
                </div>

                <div className="fee full">
                    <span>Consultation Fee:</span>
                    <strong>₹500</strong>
                    <button type="button" id="opay" disabled={!otpState.emailVerified || !otpState.phoneVerified}>Pay Now</button>
                </div>

                <div className="submit full">
                    <input type="submit" value="Confirm Appointment" id="sub" disabled={!otpState.emailVerified || !otpState.phoneVerified} className={(!otpState.emailVerified || !otpState.phoneVerified) ? 'disabled-btn' : ''} />
                </div>
            </form>
        </section>
    );
};

export default Booking;
