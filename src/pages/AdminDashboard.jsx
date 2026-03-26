import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalUsers: 0, totalDiagnoses: 0, topDiseases: [] });
    const [users, setUsers] = useState([]);
    const [feedback, setFeedback] = useState([]);
    const [diagnoses, setDiagnoses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [view, setView] = useState('stats'); // stats, users, feedback, diagnoses, diseases

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const headers = { 'x-user-role': user?.role };
                
                const [statsRes, usersRes, feedbackRes, diagnosesRes] = await Promise.all([
                    axios.get('/api/admin/stats', { headers }),
                    axios.get('/api/admin/users', { headers }),
                    axios.get('/api/admin/feedback', { headers }),
                    axios.get('/api/admin/diagnoses', { headers })
                ]);
                
                setStats(statsRes.data);
                setUsers(usersRes.data);
                setFeedback(feedbackRes.data);
                setDiagnoses(diagnosesRes.data);
            } catch (err) {
                console.error('Error fetching admin data:', err);
                setError(err.response?.data?.error || 'Failed to fetch admin data. Ensure you are logged in as an Admin.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="container" style={{padding: '2rem 0'}}>Loading...</div>;

    const navItems = [
        { id: 'stats', label: 'Stats' },
        { id: 'users', label: 'Users' },
        { id: 'diagnoses', label: 'Diagnoses' },
        { id: 'diseases', label: 'Top Diseases' },
        { id: 'feedback', label: 'Feedback' }
    ];

    return (
        <div className="container" style={{padding: '2rem 2rem'}}>
            {error && <div className="alert alert-error" style={{marginBottom: '2rem'}}>{error}</div>}
            
            <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '20px'}}>
                <h2 className="diagnosis-name" style={{border: 'none', margin: 0}}>Admin Control Center</h2>
                <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                    {navItems.map(item => (
                        <button 
                            key={item.id}
                            onClick={() => setView(item.id)} 
                            className={`btn ${view === item.id ? 'btn-primary' : 'btn-secondary'}`} 
                            style={{padding: '8px 15px', fontSize: '0.9rem'}}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>
            
            {view === 'stats' && (
                <div className="feature-grid" style={{marginBottom: '2rem'}}>
                    <div className="feature-card">
                        <div className="step-number">1</div>
                        <h4 style={{textAlign: 'center'}}>Total Users</h4>
                        <p style={{textAlign: 'center', fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)'}}>{stats.totalUsers}</p>
                    </div>

                    <div className="feature-card">
                        <div className="step-number">2</div>
                        <h4 style={{textAlign: 'center'}}>Total Diagnoses</h4>
                        <p style={{textAlign: 'center', fontSize: '2rem', fontWeight: 'bold', color: 'var(--secondary)'}}>{stats.totalDiagnoses}</p>
                    </div>

                    <div className="feature-card">
                        <div className="step-number">3</div>
                        <h4 style={{textAlign: 'center'}}>Unique Diseases</h4>
                        <p style={{textAlign: 'center', fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-dark)'}}>{stats.topDiseases.length}</p>
                    </div>
                </div>
            )}

            {view === 'users' && (
                <div className="diagnosis-card">
                    <h3 style={{marginBottom: '1.5rem'}}>Registered Users</h3>
                    <div style={{overflowX: 'auto'}}>
                        <table style={{width: '100%', borderCollapse: 'collapse'}}>
                            <thead>
                                <tr style={{borderBottom: '2px solid #eee', textAlign: 'left'}}>
                                    <th style={{padding: '12px'}}>Name</th>
                                    <th style={{padding: '12px'}}>Email</th>
                                    <th style={{padding: '12px'}}>Role</th>
                                    <th style={{padding: '12px'}}>Joined</th>
                                    <th style={{padding: '12px'}}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} style={{borderBottom: '1px solid #f0f0f0'}}>
                                        <td style={{padding: '12px'}}>{u.fullName}</td>
                                        <td style={{padding: '12px'}}>{u.email}</td>
                                        <td style={{padding: '12px'}}>
                                            <span style={{padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', background: u.role === 'ADMIN' ? '#ffebee' : '#e8f5e9', color: u.role === 'ADMIN' ? '#c62828' : '#2e7d32'}}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td style={{padding: '12px'}}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td style={{padding: '12px'}}>
                                            <button 
                                                onClick={async () => {
                                                    const newPass = window.prompt(`Enter new password for ${u.fullName}:`);
                                                    if (!newPass) return;
                                                    try {
                                                        const user = JSON.parse(localStorage.getItem('user'));
                                                        await axios.put(`/api/admin/users/${u.id}/reset-password`, { newPassword: newPass }, {
                                                            headers: { 'x-user-role': user?.role }
                                                        });
                                                        alert('Password reset successfully!');
                                                    } catch (err) {
                                                        alert('Reset failed: ' + (err.response?.data?.error || err.message));
                                                    }
                                                }}
                                                className="btn btn-secondary"
                                                style={{padding: '5px 10px', fontSize: '0.75rem'}}
                                            >
                                                Reset Password
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {view === 'diagnoses' && (
                <div className="diagnosis-card">
                    <h3 style={{marginBottom: '1.5rem'}}>Diagnosis History (All Users)</h3>
                    <div style={{overflowX: 'auto'}}>
                        <table style={{width: '100%', borderCollapse: 'collapse'}}>
                            <thead>
                                <tr style={{borderBottom: '2px solid #eee', textAlign: 'left'}}>
                                    <th style={{padding: '12px'}}>User</th>
                                    <th style={{padding: '12px'}}>Crop</th>
                                    <th style={{padding: '12px'}}>Disease</th>
                                    <th style={{padding: '12px'}}>Confidence</th>
                                    <th style={{padding: '12px'}}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {diagnoses.map(d => (
                                    <tr key={d.id} style={{borderBottom: '1px solid #f0f0f0'}}>
                                        <td style={{padding: '12px'}}>{d.user?.fullName || 'Anonymous'}</td>
                                        <td style={{padding: '12px'}}>{d.crop?.name}</td>
                                        <td style={{padding: '12px', fontWeight: 'bold', color: 'var(--primary-dark)'}}>{d.disease?.name}</td>
                                        <td style={{padding: '12px'}}>{Math.round(d.confidence * 100)}%</td>
                                        <td style={{padding: '12px'}}>{new Date(d.date).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {view === 'diseases' && (
                <div className="diagnosis-card">
                    <h3 style={{marginBottom: '1.5rem'}}>Most Frequent Diseases</h3>
                    <div style={{overflowX: 'auto'}}>
                        <table style={{width: '100%', borderCollapse: 'collapse'}}>
                            <thead>
                                <tr style={{borderBottom: '2px solid #eee', textAlign: 'left'}}>
                                    <th style={{padding: '12px'}}>Rank</th>
                                    <th style={{padding: '12px'}}>Disease Name</th>
                                    <th style={{padding: '12px'}}>Total Reports</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.topDiseases.map((d, i) => (
                                    <tr key={i} style={{borderBottom: '1px solid #f0f0f0'}}>
                                        <td style={{padding: '12px'}}>#{i + 1}</td>
                                        <td style={{padding: '12px', fontWeight: 'bold'}}>{d.name}</td>
                                        <td style={{padding: '12px'}}>
                                            <span style={{background: 'var(--primary)', color: 'white', padding: '2px 10px', borderRadius: '10px', fontSize: '0.9rem'}}>
                                                {d.count}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {view === 'feedback' && (
                <div className="diagnosis-card">
                    <h3 style={{marginBottom: '1.5rem'}}>Recent User Feedback</h3>
                    {!feedback.length && <p>No feedback received yet.</p>}
                    <div className="rules-list">
                        {feedback.map(f => (
                            <div key={f.id} className="rule-card" style={{padding: '1.5rem', marginBottom: '1rem'}}>
                                <div className="rule-header" style={{marginBottom: '10px', display: 'flex', justifyContent: 'space-between'}}>
                                    <strong>{f.user?.fullName || 'Anonymous User'}</strong>
                                    <span style={{color: '#f1c40f', fontSize: '1.2rem'}}>{'★'.repeat(f.rating)}{'☆'.repeat(5-f.rating)}</span>
                                </div>
                                <p style={{fontStyle: 'italic', color: '#555', margin: '10px 0'}}>"{f.comment || 'No comment provided'}"</p>
                                <div style={{fontSize: '0.8rem', color: '#999'}}>
                                   Submitted on: {new Date(f.createdAt).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
