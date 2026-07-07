import React from 'react';
import '../CSS/index.css';
import '../CSS/Contact.css';

const Contact = () => {
    return (
        <div className="contact-content">
            <div className="left">
                <div className="title-contact">
                    <h2>Office Details</h2>
                    <p>Find us in the heart of the city</p>
                </div>
                <div className="info-contact">
                    <div className="location">
                        <h3>Location:</h3>
                        <p>Near Martinoz Pizza, Baben</p>
                        <p>District:Surat</p>
                    </div>
                    <div className="office">
                        <h3>Office Hours:</h3>
                        <p>Mon - Fri: 9:00 AM - 6:00 PM</p>
                        <p>Saturday: 10:00 AM - 2:00 PM</p>
                        <p>Sunday: <span>Closed</span></p>
                    </div>
                    <div className="contact-contact">
                        <h3>Contact:</h3>
                        <p>Email:n16legal@gmail.com</p>
                        <p>Phone: +91 9876543210</p>
                    </div>
                </div>
            </div>

            <div className="right">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d930.2684505153458!2d73.08879457686282!3d21.149461042836833!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1774413098355!5m2!1sen!2sin"
                    title="map"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </div>
        </div>
    );
};

export default Contact;
