import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const Register = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('/api/auth/register', {
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                role: 'FARMER'
            });
            localStorage.setItem('user', JSON.stringify(res.data));
            navigate('/diagnose');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Try a different email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{padding: '4rem 0'}}>
            <form className="diagnosis-form" onSubmit={handleSubmit} style={{maxWidth: '550px'}}>
                <h2 className="diagnosis-name" style={{border: 'none'}}>Register</h2>
                {error && <div className="alert alert-error">{error}</div>}
                <div className="form-group">
                    <label>Full Name</label>
                    <input 
                        type="text" 
                        name="fullName"
                        value={formData.fullName} 
                        onChange={handleChange} 
                        required 
                        placeholder="Enter your full name"
                    />
                </div>
                <div className="form-group">
                    <label>Email Address</label>
                    <input 
                        type="email" 
                        name="email"
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                        placeholder="Enter your email"
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input 
                        type="password" 
                        name="password"
                        value={formData.password} 
                        onChange={handleChange} 
                        required 
                        placeholder="Minimum 6 characters"
                    />
                </div>
                <div className="form-group">
                    <label>Confirm Password</label>
                    <input 
                        type="password" 
                        name="confirmPassword"
                        value={formData.confirmPassword} 
                        onChange={handleChange} 
                        required 
                        placeholder="Repeat password"
                    />
                </div>
                <button type="submit" className="btn btn-primary" style={{width: '100%'}} disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
                <div className="form-link">
                    Already have an account? <Link to="/login">Login here</Link>
                </div>
            </form>
        </div>
    );
};

export default Register;
