import React, { useState, useEffect } from 'react';

const KnowledgeBasePage = () => {
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/crops')
            .then(res => res.json())
            .then(data => {
                setCrops(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching knowledge base:', err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="container" style={{ padding: '2rem 0' }}>Loading knowledge base...</div>;

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h1 style={{ textAlign: 'center', color: 'var(--primary-dark)', marginBottom: '2rem' }}>
                Disease Knowledge Base
            </h1>
            
            <div className="knowledge-base">
                {crops.length === 0 ? (
                    <p>No data available. Ensure the database is seeded.</p>
                ) : (
                    crops.map(crop => (
                        <div key={crop.id} className="crop-section">
                            <h3>{crop.name}</h3>
                            <div className="rules-list">
                                {crop.symptoms && (
                                    <div className="rule-card">
                                        <div className="rule-header"><strong>Available Symptoms</strong></div>
                                        <div className="rule-body">
                                            <ul>
                                                {crop.symptoms.map(s => <li key={s.id}>{s.description}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default KnowledgeBasePage;
