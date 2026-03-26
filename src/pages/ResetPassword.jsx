import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const location = useLocation();
    const [email, setEmail] = useState(location.state?.email || '');
    const [resetKey, setResetKey] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return setError('Passwords do not match');
        }
        
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const res = await axios.post('/api/auth/reset-password', { email, resetKey, newPassword });
            setMessage(res.data.message);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Reset failed. Please check your key.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{padding: '4rem 0'}}>
            <form className="diagnosis-form" onSubmit={handleSubmit} style={{maxWidth: '500px'}}>
                <h2 className="diagnosis-name" style={{border: 'none'}}>Update Password</h2>
                
                {error && <div className="alert alert-error">{error}</div>}
                {message && <div className="alert alert-success">{message} Redirecting to login...</div>}
                
                <div className="form-group">
                    <label>Email Address</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </div>

                <div className="form-group">
                    <label>Reset Key (from server console)</label>
                    <input 
                        type="text" 
                        value={resetKey} 
                        onChange={(e) => setResetKey(e.target.value)} 
                        required 
                        placeholder="6-digit key"
                    />
                </div>

                <div className="form-group">
                    <label>New Password</label>
                    <input 
                        type="password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        required 
                    />
                </div>

                <div className="form-group">
                    <label>Confirm New Password</label>
                    <input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        required 
                    />
                </div>
                
                <button type="submit" className="btn btn-primary" style={{width: '100%'}} disabled={loading}>
                    {loading ? 'Updating...' : 'Set New Password'}
                </button>
            </form>
        </div>
    );
};

export default ResetPassword;
