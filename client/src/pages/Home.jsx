import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/index.css';

const Home = () => {
    const navigate = useNavigate();

    return (
        <>
            <div className="hero-showcase">
                <div className="left">
                    <img src="/Asstes/Lawyer.jpg" alt="Lawyer" />
                </div>
                <div className="right">
                    <h2>Professional & Ethical Legal Consultancy</h2>
                    <p><span>Just because you did it,</span><br /> doesn't mean you are guilty.</p>
                    <button id="App" onClick={() => navigate('/booking')}>Schedule Appointment</button>
                </div>
            </div>

            <div className="services">
                <h3>Practice Areas</h3>
                <div className="criminal"><p>Criminal Law</p></div>
                <div className="civil"><p>Civil Litigation</p></div>
                <div className="corporate"><p>Corporate Law</p></div>
                <div className="family"><p>Family & Divorce Law</p></div>
                <div className="property"><p>Property & Real Estate</p></div>
                <div className="document"><p>Legal Documentation</p></div>
            </div>

            <div className="reason">
                <h2>Why Choose us?</h2>
                <div className="first">
                    <p><b>Experienced</b></p>
                    <p>Strong case analysis and courtroom strategy.</p>
                </div>
                <div className="second">
                    <p><b>Client Focused</b></p>
                    <p>Personal attention to every legal matter.</p>
                </div>
                <div className="third">
                    <p><b>Result Oriented</b></p>
                    <p>Committed to achieving the best legal outcome.</p>
                </div>
            </div>
        </>
    );
};

export default Home;
