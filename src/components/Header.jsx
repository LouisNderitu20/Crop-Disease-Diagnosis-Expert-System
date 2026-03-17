import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <header>
            <div className="container header-container">
                <div className="logo">
                    <h1><i className="fas fa-leaf"></i> Crop Doctor</h1>
                    <p>Expert System for Crop Disease Diagnosis</p>
                </div>
                <nav>
                    <ul>
                        <li><Link to="/" className={isActive('/')}><i className="fas fa-home"></i> Home</Link></li>
                        <li><Link to="/diagnose" className={isActive('/diagnose')}><i className="fas fa-stethoscope"></i> Diagnose Crop</Link></li>
                        <li><Link to="/knowledge-base" className={isActive('/knowledge-base')}><i className="fas fa-book"></i> Knowledge Base</Link></li>
                        <li><Link to="/history" className={isActive('/history')}><i className="fas fa-clock-rotate-left"></i> Diagnosis History</Link></li>
                        <li><Link to="/login" className={isActive('/login')}><i className="fas fa-sign-in-alt"></i> Login</Link></li>
                        <li><Link to="/register" className={isActive('/register')}><i className="fas fa-user-plus"></i> Register</Link></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
