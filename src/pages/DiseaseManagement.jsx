import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DiseaseManagement = () => {
    const [diseases, setDiseases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [currentDisease, setCurrentDisease] = useState({ name: '', description: '', treatment: [], prevention: [] });

    useEffect(() => {
        fetchDiseases();
    }, []);

    const fetchDiseases = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const res = await axios.get('/api/admin/diseases', {
                headers: { 'x-user-role': user?.role }
            });
            setDiseases(res.data);
        } catch (err) {
            console.error('Error fetching diseases:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this disease?')) return;
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            await axios.delete(`/api/admin/diseases/${id}`, {
                headers: { 'x-user-role': user?.role }
            });
            fetchDiseases();
        } catch (err) {
            alert('Delete failed');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const data = {
                ...currentDisease,
                treatment: typeof currentDisease.treatment === 'string' ? currentDisease.treatment.split('\n') : currentDisease.treatment,
                prevention: typeof currentDisease.prevention === 'string' ? currentDisease.prevention.split('\n') : currentDisease.prevention
            };
            if (currentDisease.id) {
                await axios.put(`/api/admin/diseases/${currentDisease.id}`, data, {
                    headers: { 'x-user-role': user?.role }
                });
            } else {
                await axios.post('/api/admin/diseases', data, {
                    headers: { 'x-user-role': user?.role }
                });
            }
            setShowForm(false);
            setCurrentDisease({ name: '', description: '', treatment: [], prevention: [] });
            fetchDiseases();
        } catch (err) {
            alert('Save failed');
        }
    };

    if (loading) return <div className="container" style={{padding: '2rem 0'}}>Loading...</div>;

    return (
        <div className="container" style={{padding: '2rem 0'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                <h2>Disease Management</h2>
                <button onClick={() => setShowForm(true)} className="btn btn-primary">
                    + Add Disease
                </button>
            </div>

            {showForm && (
                <div style={{background: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
                    <div className="diagnosis-form" style={{maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto'}}>
                        <h3>{currentDisease.id ? 'Edit Disease' : 'Add New Disease'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Name</label>
                                <input type="text" value={currentDisease.name} onChange={(e) => setCurrentDisease({...currentDisease, name: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea value={currentDisease.description} onChange={(e) => setCurrentDisease({...currentDisease, description: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Treatment (one per line)</label>
                                <textarea rows="5" value={Array.isArray(currentDisease.treatment) ? currentDisease.treatment.join('\n') : currentDisease.treatment} onChange={(e) => setCurrentDisease({...currentDisease, treatment: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Prevention (one per line)</label>
                                <textarea rows="5" value={Array.isArray(currentDisease.prevention) ? currentDisease.prevention.join('\n') : currentDisease.prevention} onChange={(e) => setCurrentDisease({...currentDisease, prevention: e.target.value})} />
                            </div>
                            <div style={{display: 'flex', gap: '10px'}}>
                                <button type="submit" className="btn btn-primary">Save</button>
                                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="rules-list">
                {diseases.map(d => (
                    <div key={d.id} className="rule-card">
                        <div className="rule-header">
                            <strong>{d.name}</strong>
                            <div style={{display: 'flex', gap: '10px'}}>
                                <button onClick={() => { setCurrentDisease(d); setShowForm(true); }} className="btn btn-primary" style={{padding: '5px 15px', fontSize: '0.8rem'}}>Edit</button>
                                <button onClick={() => handleDelete(d.id)} className="btn btn-secondary" style={{padding: '5px 15px', fontSize: '0.8rem'}}>Delete</button>
                            </div>
                        </div>
                        <div className="rule-body">
                            <p>{d.description?.substring(0, 150)}...</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DiseaseManagement;
