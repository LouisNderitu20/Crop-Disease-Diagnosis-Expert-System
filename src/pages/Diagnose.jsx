import React, { useState, useEffect } from 'react';
import ExplanationFacility from '../logic/explanation-facility';

const Diagnose = () => {
    const [crops, setCrops] = useState([]);
    const [crop, setCrop] = useState('');
    const [symptoms, setSymptoms] = useState([]);
    const [envFactors, setEnvFactors] = useState({
        high_humidity: false,
        recent_rain: false
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [explanation, setExplanation] = useState(null);

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
            prev.includes(symptomId)
                ? prev.filter(id => id !== symptomId)
                : [...prev, symptomId]
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
            const response = await fetch('/api/diagnose', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    crop,
                    symptoms,
                    environmental: envFactors,
                    userId: user?.id
                })
            });

            const diagResult = await response.json();

            const explainer = new ExplanationFacility();
            const diagExplanation = explainer.generateExplanation(diagResult, { crop, symptoms, environmental: envFactors });

            setResult(diagResult);
            setExplanation(diagExplanation);
        } catch (err) {
            console.error('Diagnosis error:', err);
            alert('Error performing diagnosis. Check if server is running.');
        } finally {
            setLoading(false);
        }
    };

    const resetDiagnosis = () => {
        setResult(null);
        setExplanation(null);
        setCrop('');
        setSymptoms([]);
    };

    const selectedCropData = crops.find(c => c.name === crop);

    const renderForm = () => (
        <form className="diagnosis-form" onSubmit={performDiagnosis}>
            <div className="form-group">
                <label htmlFor="cropSelect">Select Crop Type:</label>
                <select id="cropSelect" value={crop} onChange={handleCropChange} required>
                    <option value=""> Choose a crop </option>
                    {crops.map(c => (
                        <option key={c.id} value={c.name}>{c.name.charAt(0).toUpperCase() + c.name.slice(1)}</option>
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
                                type="checkbox"
                                id="high_humidity"
                                checked={envFactors.high_humidity}
                                onChange={() => handleEnvToggle('high_humidity')}
                            />
                            <label htmlFor="high_humidity">High humidity conditions</label>
                        </div>
                        <div className="symptom-option">
                            <input
                                type="checkbox"
                                id="recent_rain"
                                checked={envFactors.recent_rain}
                                onChange={() => handleEnvToggle('recent_rain')}
                            />
                            <label htmlFor="recent_rain">Recent rainfall</label>
                        </div>
                    </div>
                </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                <i className="fas fa-stethoscope"></i> Diagnose Now
            </button>
        </form>
    );

    const renderResults = () => {
        const topDiagnosis = result.diagnoses[0];

        return (
            <div className="diagnosis-card">
                {!topDiagnosis ? (
                    <div className="alert alert-info">
                        <h3>No Specific Disease Found</h3>
                        <p>Based on the symptoms provided, no matching disease was identified.</p>
                        <div className="explanation-box">
                            <h4>Possible Reasons:</h4>
                            <ul>
                                <li>Nutrient deficiency in soil</li>
                                <li>Environmental stress (drought or excess water)</li>
                                <li>Pest damage without disease</li>
                                <li>Rare or new disease not in database</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h3 className="diagnosis-name">{topDiagnosis.disease}</h3>
                        <div className="alert alert-success">
                            <strong>Confidence Level:</strong> {Math.round(topDiagnosis.confidence * 100)}%
                        </div>

                        <div className="treatment-section">
                            <h4>Recommended Treatment:</h4>
                            <ul>
                                {topDiagnosis.treatment.map((t, i) => <li key={i}>{t}</li>)}
                            </ul>
                        </div>

                        <div className="treatment-section">
                            <h4>Prevention Measures:</h4>
                            <ul>
                                {topDiagnosis.prevention.map((p, i) => <li key={i}>{p}</li>)}
                            </ul>
                        </div>

                        <div className="explanation-section">
                            <h4>How We Reached This Conclusion:</h4>
                            <div className="explanation-box">
                                <p>{explanation.summary.ruleExplanation}</p>
                            </div>
                        </div>

                        {explanation.educational && (
                            <div className="educational-section">
                                <h4>Learn More:</h4>
                                <p>{explanation.educational.description}</p>
                                <ul>
                                    {explanation.educational.tips?.map((t, i) => <li key={i}>{t}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                <div className="diagnosis-actions">
                    <button onClick={resetDiagnosis} className="btn btn-primary">Diagnose Another Crop</button>
                    <button onClick={() => window.print()} className="btn btn-primary">Print Results</button>
                </div>
            </div>
        );
    };

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
