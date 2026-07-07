import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import '../CSS/index.css';
import '../CSS/Login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const DASHBOARDS = {
        admin: '/dashboard/admin',
        lawyer: '/dashboard/lawyer',
        receptionist: '/dashboard/receptionist',
        client: '/dashboard/client',
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const loggedInUser = await login(formData.email, formData.password);
            toast.success('Logged in successfully!');
            navigate(DASHBOARDS[loggedInUser?.role] || '/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <section className="form login-container">
            <div className="glass-panel">
                <form id="login-form" onSubmit={handleSubmit}>
                    <div className="title-lgn">
                        <h1>N16 Legal</h1>
                        <p>Secure Client Access Portal</p>
                    </div>

                    <div className="field">
                        <label htmlFor="email-lgn">Email Address</label>
                        <input type="email" id="email-lgn" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} required />
                    </div>

                    <div className="field">
                        <label htmlFor="pass-lgn">Password</label>
                        <input type="password" id="pass-lgn" name="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} required />
                    </div>

                    <div className="login-actions">
                        <input type="submit" value="Sign In" className="btn-primary" />
                    </div>
                </form>
            </div>
        </section>
    );
};

export default Login;
