import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        if (theme === 'light') {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const handleDashboardRedirect = () => {
        if (!user) return;
        if (user.role === 'admin') navigate('/dashboard/admin');
        else if (user.role === 'lawyer') navigate('/dashboard/lawyer');
        else if (user.role === 'receptionist') navigate('/dashboard/receptionist');
        else navigate('/dashboard/client');
    };

    return (
        <div className="navbar">
            <nav>
                <p><span>N16 Legal</span></p>
                <Link to="/">Home</Link>
                <Link to="/about">About us</Link>
                <Link to="/lawyers">Our Lawyers</Link>
                <Link to="/booking">Booking</Link>
                <Link to="/contact">Contact us</Link>
                
                <div style={{display: 'flex', gap: '10px', marginLeft: 'auto', alignItems: 'center'}}>
                    <button 
                        onClick={toggleTheme} 
                        style={{background: 'transparent', border: '1px solid var(--gold)', color: 'var(--gold)', padding: '5px 10px', cursor: 'pointer', fontFamily: 'Cinzel'}}
                    >
                        {theme === 'dark' ? '☀ Light' : '☾ Dark'}
                    </button>
                    {user ? (
                        <button id="lgn" style={{background: '#333', marginLeft: '10px'}} onClick={handleDashboardRedirect}>Dashboard</button>
                    ) : (
                        <button id="lgn" onClick={() => navigate('/login')} style={{marginLeft: '10px'}}>Login</button>
                    )}
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
