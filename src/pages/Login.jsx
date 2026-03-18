import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('user', JSON.stringify(data));
                alert('Login successful!');
                navigate('/');
            } else {
                alert(data.error || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            alert('Error connecting to server');
        }
    };

    return (
        <div className="container" style={{ padding: '4rem 0' }}>
            <div className="diagnosis-form" style={{ maxWidth: '450px' }}>
                <h2 style={{ marginBottom: '2rem' }}>Login to Crop Doctor</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            placeholder="Enter your email" 
                            required 
                            value={credentials.email}
                            onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            placeholder="Min 6 characters" 
                            required 
                            value={credentials.password}
                            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                        Login
                    </button>
                    <div className="form-link">
                        Don't have an account? <Link to="/register">Register here</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
