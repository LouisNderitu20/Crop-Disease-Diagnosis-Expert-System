import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            setUser(null);
        }
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
    };

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
                        {user && <li><Link to="/history" className={isActive('/history')}><i className="fas fa-clock-rotate-left"></i> History</Link></li>}
                        
                        {user ? (
                            <>
                                <li className="user-greeting" style={{display: 'flex', alignItems: 'center'}}>
                                    <span style={{color: 'var(--primary-dark)', fontWeight: 'bold', marginRight: '15px'}}><i className="fas fa-user-circle"></i> Hello, {user.fullName ? user.fullName.split(' ')[0] : 'User'}</span>
                                </li>
                                <li style={{display: 'flex', alignItems: 'center'}}>
                                    <button onClick={handleLogout} className="btn-logout" style={{background: 'none', border: 'none', color: '#d9534f', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold', padding: 0}}>
                                        <i className="fas fa-sign-out-alt"></i> Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li><Link to="/login" className={isActive('/login')}><i className="fas fa-sign-in-alt"></i> Login</Link></li>
                                <li><Link to="/register" className={isActive('/register')}><i className="fas fa-user-plus"></i> Register</Link></li>
                            </>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
