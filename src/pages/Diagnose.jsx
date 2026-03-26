import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';

const Diagnose = () => {
    const [crops, setCrops] = useState([]);
    const [crop, setCrop] = useState('');
    const [symptoms, setSymptoms] = useState([]);
    const [envFactors, setEnvFactors] = useState({ high_humidity: false, recent_rain: false });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedback, setFeedback] = useState({ rating: 5, comment: '' });

    useEffect(() => {
        fetch('/api/crops')
            .then(res => res.json())
            .then(data => setCrops(data))
            .catch(err => console.error('Error fetching crops:', err));
    }, []);

    const handleCropChange = (e) => {
        setCrop(e.target.value);
        setSymptoms([]);
        setResult(null);
    };

    const handleSymptomToggle = (symptomId) => {
        setSymptoms(prev => 
            prev.includes(symptomId) ? prev.filter(id => id !== symptomId) : [...prev, symptomId]
        );
    };

    const handleEnvToggle = (factor) => {
        setEnvFactors(prev => ({ ...prev, [factor]: !prev[factor] }));
    };

    const performDiagnosis = async (e) => {
        e.preventDefault();
        if (!crop) return alert('Please select a crop type');
        if (symptoms.length === 0) return alert('Please select at least one symptom');

        setLoading(true);
        const user = JSON.parse(localStorage.getItem('user') || 'null');

        try {
            const response = await axios.post('/api/diagnose', {
                crop,
                symptoms: JSON.stringify(symptoms),
                environmental: JSON.stringify(envFactors),
                userId: user?.id
            });
            setResult(response.data);
        } catch (err) {
            console.error('Diagnosis error:', err);
            alert('Error performing diagnosis. Check if server is running.');
        } finally {
            setLoading(false);
        }
    };

    const resetDiagnosis = () => {
        setResult(null);
        setCrop('');
        setSymptoms([]);
        setEnvFactors({ high_humidity: false, recent_rain: false });
    };

    const exportPDF = () => {
        const doc = jsPDF();
        doc.setFontSize(20);
        doc.text("Crop Diagnosis Report", 20, 20);
        doc.setFontSize(12);
        doc.text(`Crop: ${crop}`, 20, 30);
        doc.text(`Date: ${new Date().toLocaleString()}`, 20, 40);
        
        let y = 50;
        result.diagnoses.forEach((diag, i) => {
            doc.setFont(undefined, 'bold');
            doc.text(`${i+1}. ${diag.disease} (${Math.round(diag.confidence * 100)}%)`, 20, y);
            doc.setFont(undefined, 'normal');
            y += 10;
            doc.text("Treatment:", 25, y);
            y += 5;
            diag.treatment.forEach(tr => {
                doc.text(`- ${tr}`, 30, y);
                y += 5;
            });
            y += 10;
        });
        doc.save("diagnosis_report.pdf");
    };

    const submitFeedback = async () => {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        try {
            await axios.post('/api/feedback', {
                userId: user?.id,
                diagnosisId: result.diagnosisId,
                rating: feedback.rating,
                comment: feedback.comment
            });
            alert('Feedback submitted!');
            setShowFeedback(false);
        } catch (err) {
            console.error('Feedback error:', err);
        }
    };

    const selectedCropData = crops.find(c => c.name === crop);

    const renderForm = () => (
        <form className="diagnosis-form" onSubmit={performDiagnosis}>
            <div className="form-group">
                <label htmlFor="cropSelect">Select Crop Type:</label>
                <select id="cropSelect" value={crop} onChange={handleCropChange} required>
                    <option value=""> Choose a crop </option>
                    {crops.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>Identify Symptoms:</label>
                <div id="symptomsContainer">
                    {selectedCropData ? (
                        <div className="symptom-options">
                            {selectedCropData.symptoms.map(s => (
                                <div key={s.id} className="symptom-option">
                                    <input
                                        type="checkbox"
                                        id={s.symptomId}
                                        checked={symptoms.includes(s.symptomId)}
                                        onChange={() => handleSymptomToggle(s.symptomId)}
                                    />
                                    <label htmlFor={s.symptomId}>{s.description}</label>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-symptoms">Please select a crop to see symptoms</p>
                    )}
                </div>
            </div>

            {crop && (
                <div className="form-group">
                    <label>Environmental Factors (optional):</label>
                    <div className="symptom-options">
                        <div className="symptom-option">
                            <input
                                type="checkbox" id="high_humidity" checked={envFactors.high_humidity}
                                onChange={() => handleEnvToggle('high_humidity')}
                            />
                            <label htmlFor="high_humidity">High humidity</label>
                        </div>
                        <div className="symptom-option">
                            <input
                                type="checkbox" id="recent_rain" checked={envFactors.recent_rain}
                                onChange={() => handleEnvToggle('recent_rain')}
                            />
                            <label htmlFor="recent_rain">Recent rain</label>
                        </div>
                    </div>
                </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                <i className="fas fa-stethoscope"></i> Diagnose Now
            </button>
        </form>
    );

    const renderResults = () => (
        <div className="diagnosis-card">
            {result.diagnoses.length === 0 ? (
                <div className="alert alert-info">
                    <h3>No Specific Disease Found</h3>
                    <p>No matching disease was identified. Try adding more symptoms.</p>
                </div>
            ) : (
                <div>
                    <h2 style={{textAlign: 'center', marginBottom: '20px'}}>Diagnosis Results</h2>
                    {result.diagnoses.map((diag, index) => (
                        <div key={index} style={{marginBottom: '30px', borderBottom: index < result.diagnoses.length - 1 ? '1px solid #eee' : 'none', paddingBottom: '20px'}}>
                            <h3 className="diagnosis-name">{diag.disease}</h3>
                            <div className={`alert ${index === 0 ? 'alert-success' : 'alert-warning'}`}>
                                <strong>Confidence:</strong> {Math.round(diag.confidence * 100)}%
                            </div>

                            <div className="treatment-section">
                                <h4>Recommended Treatment:</h4>
                                <ul>
                                    {diag.treatment.map((t, i) => <li key={i}>{t}</li>)}
                                </ul>
                            </div>

                            <div className="treatment-section">
                                <h4>Prevention Measures:</h4>
                                <ul>
                                    {diag.prevention.map((p, i) => <li key={i}>{p}</li>)}
                                </ul>
                            </div>
                        </div>
                    ))}

                    {result.clarifyingQuestions?.length > 0 && (
                        <div className="alert alert-info">
                            <h4>Clarifying Questions</h4>
                            <p>Improve accuracy by checking these:</p>
                            <div style={{display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap'}}>
                                {result.clarifyingQuestions.map((q, i) => {
                                    const description = selectedCropData?.symptoms.find(s => s.symptomId === q)?.description || 
                                                       q.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                                    return (
                                        <button key={i} onClick={() => handleSymptomToggle(q)} className="btn btn-secondary" style={{padding: '5px 10px', fontSize: '0.8rem'}}>
                                            {description}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="diagnosis-actions" style={{marginTop: '2rem'}}>
                <button onClick={resetDiagnosis} className="btn btn-primary">Diagnose Another Crop</button>
                <button onClick={exportPDF} className="btn btn-primary">Export PDF</button>
                <button onClick={() => setShowFeedback(true)} className="btn btn-secondary">Feedback</button>
            </div>

            {showFeedback && (
                <div style={{marginTop: '20px', padding: '20px', background: '#f9f9f9', borderRadius: '10px'}}>
                    <h4>Give Us Feedback</h4>
                    <div className="form-group">
                        <label>Rating (1-5)</label>
                        <input type="number" min="1" max="5" value={feedback.rating} onChange={(e) => setFeedback({...feedback, rating: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label>Comments</label>
                        <textarea value={feedback.comment} onChange={(e) => setFeedback({...feedback, comment: e.target.value})} />
                    </div>
                    <button onClick={submitFeedback} className="btn btn-primary">Submit</button>
                </div>
            )}
        </div>
    );

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h1 style={{ textAlign: 'center', color: 'var(--primary-dark)', marginBottom: '2rem' }}>
                Crop Disease Diagnosis
            </h1>

            {loading && <div id="loadingSpinner" style={{ display: 'block' }}></div>}

            {!result ? renderForm() : renderResults()}
        </div>
    );
};

export default Diagnose;
