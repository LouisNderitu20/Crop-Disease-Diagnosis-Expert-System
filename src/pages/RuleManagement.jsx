import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RuleManagement = () => {
    const [rules, setRules] = useState([]);
    const [crops, setCrops] = useState([]);
    const [diseases, setDiseases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');
    const [newRule, setNewRule] = useState({
        ruleId: '',
        cropId: '',
        diseaseId: '',
        conditionSymptoms: [],
        confidence: 0.8
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const headers = { 'x-user-role': user?.role };
            const [rulesRes, cropsRes, diseasesRes] = await Promise.all([
                axios.get('/api/admin/rules', { headers }),
                axios.get('/api/crops'),
                axios.get('/api/admin/diseases', { headers })
            ]);
            setRules(rulesRes.data);
            setCrops(cropsRes.data);
            setDiseases(diseasesRes.data);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            await axios.post('/api/admin/rules', newRule, {
                headers: { 'x-user-role': user?.role }
            });
            setShowForm(false);
            setNewRule({ ruleId: '', cropId: '', diseaseId: '', conditionSymptoms: [], confidence: 0.8 });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save rule');
        }
    };

    if (loading) return <div className="container" style={{padding: '2rem 0'}}>Loading...</div>;

    const selectedCrop = crops.find(c => c.id === parseInt(newRule.cropId));

    return (
        <div className="container" style={{padding: '2rem 0'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                <h2>Rule Management</h2>
                <button onClick={() => setShowForm(true)} className="btn btn-primary">
                    + Add Rule
                </button>
            </div>

            {showForm && (
                <div style={{background: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
                    <div className="diagnosis-form" style={{maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto'}}>
                        <h3>Add New Rule</h3>
                        {error && <div className="alert alert-error" style={{marginBottom: '1rem'}}>{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Rule ID (Unique)</label>
                                <input type="text" value={newRule.ruleId} onChange={(e) => setNewRule({...newRule, ruleId: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Crop</label>
                                <select value={newRule.cropId} onChange={(e) => setNewRule({...newRule, cropId: e.target.value, conditionSymptoms: []})} required>
                                    <option value="">Select Crop</option>
                                    {crops.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Disease</label>
                                <select value={newRule.diseaseId} onChange={(e) => setNewRule({...newRule, diseaseId: e.target.value})} required>
                                    <option value="">Select Disease</option>
                                    {diseases.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            
                            {selectedCrop && (
                                <div className="form-group">
                                    <label>Symptoms (Select Multiple)</label>
                                    <div className="symptom-options" style={{maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px'}}>
                                        {selectedCrop.symptoms.map(s => (
                                            <div key={s.id} className="symptom-option" style={{background: 'none', border: 'none', padding: '5px'}}>
                                                <input 
                                                    type="checkbox" 
                                                    id={`symp-${s.symptomId}`}
                                                    checked={newRule.conditionSymptoms.includes(s.symptomId)} 
                                                    onChange={(e) => {
                                                        const syms = e.target.checked 
                                                            ? [...newRule.conditionSymptoms, s.symptomId]
                                                            : newRule.conditionSymptoms.filter(id => id !== s.symptomId);
                                                        setNewRule({...newRule, conditionSymptoms: syms});
                                                    }}
                                                />
                                                <label htmlFor={`symp-${s.symptomId}`} style={{fontWeight: 'normal'}}>{s.description}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <label>Confidence (0.0 - 1.0)</label>
                                <input type="number" step="0.1" min="0" max="1" value={newRule.confidence} onChange={(e) => setNewRule({...newRule, confidence: e.target.value})} />
                            </div>
                            <div style={{display: 'flex', gap: '10px'}}>
                                <button type="submit" className="btn btn-primary">Save Rule</button>
                                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="rules-list">
                {rules.map(r => (
                    <div key={r.id} className="rule-card">
                        <div className="rule-header">
                            <strong>{r.ruleId}</strong>
                            <span className="confidence">{r.confidence}</span>
                        </div>
                        <div className="rule-body">
                            <p><strong>Crop:</strong> {r.crop?.name}</p>
                            <p><strong>Disease:</strong> {r.disease?.name}</p>
                            <p><strong>Symptoms:</strong> {JSON.parse(r.conditionSymptoms).join(', ')}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RuleManagement;
