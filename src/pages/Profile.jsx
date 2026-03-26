import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ fullName: '', email: '' });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            setFormData({ fullName: parsed.fullName, email: parsed.email });
        }
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        try {
            const res = await axios.put(`/api/auth/profile/${user.id}`, formData);
            localStorage.setItem('user', JSON.stringify(res.data));
            setUser(res.data);
            setIsEditing(false);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Update failed' });
        }
    };

    if (!user) return <div className="container" style={{padding: '2rem 0'}}>Please login to view profile.</div>;

    return (
        <div className="container" style={{padding: '2rem 0'}}>
            <h2 className="diagnosis-name" style={{border: 'none'}}>My Profile</h2>
            <div className="diagnosis-card" style={{maxWidth: '600px', margin: '0 auto'}}>
                <div style={{textAlign: 'center', marginBottom: '2rem'}}>
                    <div className="step-number" style={{width: '80px', height: '80px', fontSize: '2rem', margin: '0 auto'}}>
                        <i className="fas fa-user"></i>
                    </div>
                    {!isEditing && (
                        <>
                            <h3 style={{color: 'var(--primary-dark)', marginTop: '1rem'}}>{user.fullName}</h3>
                            <p style={{color: 'var(--text-light)', textTransform: 'uppercase'}}>{user.role}</p>
                        </>
                    )}
                </div>

                {message.text && (
                    <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`} style={{marginBottom: '1rem'}}>
                        {message.text}
                    </div>
                )}

                {isEditing ? (
                    <form onSubmit={handleUpdate} className="diagnosis-form" style={{border: 'none', padding: 0}}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input 
                                type="text" 
                                value={formData.fullName} 
                                onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input 
                                type="email" 
                                value={formData.email} 
                                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                required 
                            />
                        </div>
                        <div style={{display: 'flex', gap: '10px', marginTop: '1rem'}}>
                            <button type="submit" className="btn btn-primary" style={{flex: 1}}>Save Changes</button>
                            <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary" style={{flex: 1}}>Cancel</button>
                        </div>
                    </form>
                ) : (
                    <>
                        <div className="treatment-section" style={{marginBottom: '2rem'}}>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Member Since:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                        </div>

                        <div className="diagnosis-actions">
                            <button onClick={() => setIsEditing(true)} className="btn btn-primary" style={{width: '100%'}}>
                                <i className="fas fa-edit"></i> Edit Profile
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Profile;
