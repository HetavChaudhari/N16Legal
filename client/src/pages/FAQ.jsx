import React from 'react';
import '../CSS/index.css';

const FAQ = () => {
    return (
        <div style={{ padding: '100px 10%', minHeight: '60vh' }}>
            <h1 style={{ fontFamily: 'Playfair Display', color: 'var(--gold)', marginBottom: '30px' }}>Frequently Asked Questions</h1>
            
            <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: 'var(--cream)' }}>How do I book an appointment?</h3>
                <p style={{ color: 'var(--text-muted)' }}>You can book an appointment by navigating to the "Booking" page, selecting a lawyer, and choosing your preferred time slot.</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: 'var(--cream)' }}>What are the consultation fees?</h3>
                <p style={{ color: 'var(--text-muted)' }}>Consultation fees vary by lawyer. You can view each lawyer's fee on the "Our Lawyers" directory page before booking.</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: 'var(--cream)' }}>Can I reschedule or cancel my appointment?</h3>
                <p style={{ color: 'var(--text-muted)' }}>Yes, you can manage your appointments directly from the Client Dashboard. Please notify us at least 24 hours in advance.</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: 'var(--cream)' }}>Is my case information confidential?</h3>
                <p style={{ color: 'var(--text-muted)' }}>Absolutely. All communications and case details shared on N16Legal are strictly confidential and protected by attorney-client privilege.</p>
            </div>
        </div>
    );
};

export default FAQ;
