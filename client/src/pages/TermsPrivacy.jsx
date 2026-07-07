import React from 'react';
import '../CSS/index.css';

const TermsPrivacy = () => {
    return (
        <div style={{ padding: '100px 10%', minHeight: '60vh' }}>
            <h1 style={{ fontFamily: 'Playfair Display', color: 'var(--gold)', marginBottom: '30px' }}>Terms of Service & Privacy Policy</h1>
            
            <section style={{ marginBottom: '40px' }}>
                <h2 style={{ color: 'var(--cream)', marginBottom: '15px' }}>1. Terms of Service</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>By accessing and using N16Legal, you agree to comply with our platform's terms. Our platform serves as a medium to connect clients with verified legal professionals.</p>
                <p style={{ color: 'var(--text-muted)' }}>Consultation fees are non-refundable unless a cancellation is made 24 hours prior to the appointment. Abuse of the platform or submission of false information will result in immediate account suspension.</p>
            </section>

            <section>
                <h2 style={{ color: 'var(--cream)', marginBottom: '15px' }}>2. Privacy Policy</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>Your privacy is our utmost priority. N16Legal collects basic profile information and case descriptions solely for the purpose of connecting you with the appropriate legal counsel.</p>
                <p style={{ color: 'var(--text-muted)' }}>We do not sell your personal data to third parties. All data transmissions are secured, and sensitive case notes are restricted to the assigned lawyer.</p>
            </section>
        </div>
    );
};

export default TermsPrivacy;
