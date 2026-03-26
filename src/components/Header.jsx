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
        localStorage.removeItem('token');
        setUser(null);
        navigate('/');
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <header>
            <div className="container header-container">
                <div className="logo">
                    <h1><i className="fas fa-leaf"></i> Crop Doctor</h1>
                    <p>Crop Disease Diagnosis System</p>
                </div>
                <nav>
                    <ul style={{gap: '1.5rem', alignItems: 'center'}}>
                        <li><Link to="/" className={isActive('/')}><i className="fas fa-home"></i> Home</Link></li>
                        <li><Link to="/diagnose" className={isActive('/diagnose')}><i className="fas fa-stethoscope"></i> Diagnose</Link></li>
                        
                        {user && user.role === 'ADMIN' && (
                            <>
                                <li><Link to="/admin/dashboard" className={isActive('/admin/dashboard')}><i className="fas fa-chart-line"></i> Admin</Link></li>
                                <li><Link to="/admin/rules" className={isActive('/admin/rules')}><i className="fas fa-list-check"></i> Rules</Link></li>
                                <li><Link to="/admin/diseases" className={isActive('/admin/diseases')}><i className="fas fa-virus"></i> Diseases</Link></li>
                            </>
                        )}

                        {user && user.role === 'FARMER' && (
                            <li><Link to="/history" className={isActive('/history')}><i className="fas fa-history"></i> History</Link></li>
                        )}

                        <li><Link to="/knowledge-base" className={isActive('/knowledge-base')}><i className="fas fa-book"></i> Knowledge</Link></li>

                        {user ? (
                            <>
                                <li style={{color: 'var(--primary-dark)', fontWeight: '600'}}>
                                    <Link to="/profile" className={isActive('/profile')} style={{border: 'none'}}>
                                        <i className="fas fa-user-circle"></i> Hello, {user.fullName ? user.fullName.split(' ')[0] : 'User'}
                                    </Link>
                                </li>
                                <li>
                                    <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} style={{color: '#c62828', fontWeight: '600', padding: '5px 10px', borderRadius: '5px', border: '1px solid rgba(198, 40, 40, 0.2)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px'}}>
                                        <i className="fas fa-sign-out-alt"></i> Logout
                                    </a>
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
