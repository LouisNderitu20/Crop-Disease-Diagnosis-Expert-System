import React, { useState, useEffect } from 'react';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        const url = user ? `/api/history?userId=${user.id}` : '/api/history';
        
        fetch(url)
            .then(res => res.json())
            .then(data => {
                setHistory(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching history:', err);
                setLoading(false);
            });
    }, []);

    const clearHistory = () => {
        alert('Clear history functionality needs backend implementation.');
    };

    if (loading) return <div className="container" style={{ padding: '2rem 0' }}>Loading history...</div>;

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h1 style={{ textAlign: 'center', color: 'var(--primary-dark)', marginBottom: '2rem' }}>
                Diagnosis History
            </h1>

            {!history.length ? (
                <div className="alert alert-info" style={{ textAlign: 'center' }}>
                    No diagnosis history found. Start diagnosing crops!
                </div>
            ) : (
                <>
                    <div className="history-list">
                        {history.map(record => (
                            <div key={record.id} className="history-card">
                                <div className="history-header">
                                    <span className="history-date">{new Date(record.date).toLocaleString()}</span>
                                    <span className="history-crop">{record.crop.name}</span>
                                </div>
                                <div className="history-body">
                                    <p><strong>Diagnosis:</strong> {record.disease.name}</p>
                                    <p><strong>Confidence:</strong> {Math.round(record.confidence * 100)}%</p>
                                    <p><strong>Symptoms:</strong> {JSON.parse(record.symptoms).join(', ')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <button onClick={clearHistory} className="btn btn-primary">
                            Clear History
                        </button>
                    </div> */}
                </>
            )}
        </div>
    );
};

export default History;
