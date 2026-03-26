import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const res = await axios.post('/api/auth/forgot-password', { email });
            setMessage(res.data.message);
            // After 3 seconds, redirect to reset page
            setTimeout(() => {
                navigate('/reset-password', { state: { email } });
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to request reset. Check if the email is correct.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{padding: '4rem 0'}}>
            <form className="diagnosis-form" onSubmit={handleSubmit} style={{maxWidth: '500px'}}>
                <h2 className="diagnosis-name" style={{border: 'none'}}>Reset Password</h2>
                <p style={{textAlign: 'center', color: 'var(--text-light)', marginBottom: '1.5rem'}}>
                    Enter your email address and we'll show reset instructions in the server console.
                </p>
                
                {error && <div className="alert alert-error">{error}</div>}
                {message && <div className="alert alert-success">{message} Redirecting...</div>}
                
                <div className="form-group">
                    <label>Email Address</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        placeholder="Enter your registered email"
                    />
                </div>
                
                <button type="submit" className="btn btn-primary" style={{width: '100%'}} disabled={loading}>
                    {loading ? 'Processing...' : 'Request Reset Key'}
                </button>
                
                <div className="form-link">
                    Remember your password? <Link to="/login">Login here</Link>
                </div>
            </form>
        </div>
    );
};

export default ForgotPassword;
