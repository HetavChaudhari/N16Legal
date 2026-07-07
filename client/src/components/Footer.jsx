import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <div className="footer">
            <footer>
                <div className="left">
                    <p><b>N16 Legal</b></p>
                    <p>Professional Legal Consultancy Services in Surat.</p>
                </div>
                <div className="center">
                    <p><b>Quick Link</b></p>
                    <Link to="/">Home</Link>
                    <Link to="/about">About us</Link>
                    <Link to="/lawyers">Our Lawyers</Link>
                    <Link to="/faq">FAQ</Link>
                    <Link to="/terms">Terms & Privacy</Link>
                </div>
                <div className="right">
                    <p><b>Contact</b></p>
                    <p>Phone:+91 9876543210</p>
                    <p>Email:n16legal@gmail.com</p>
                </div>
            </footer>
        </div>
    );
};

export default Footer;
