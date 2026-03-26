import React, { useState, useEffect } from 'react';
import axios from 'axios';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            const url = user ? `/api/history?userId=${user.id}` : '/api/history';
            
            try {
                const res = await axios.get(url);
                setHistory(res.data);
            } catch (err) {
                console.error('Error fetching history:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const formatSymptom = (id) => id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    if (loading) return <div className="container" style={{ padding: '2rem 0' }}>Loading...</div>;

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h1 className="diagnosis-name" style={{border: 'none'}}>
                Diagnosis History
            </h1>

            {!history.length ? (
                <div className="alert alert-info" style={{ textAlign: 'center' }}>
                    <p>No diagnosis history found. Start diagnosing crops!</p>
                </div>
            ) : (
                <div className="history-list">
                    {history.map(record => (
                        <div key={record.id} className="history-card">
                            <div className="history-header">
                                <span className="history-date">{new Date(record.date).toLocaleString()}</span>
                                <span className="history-crop">{record.crop?.name}</span>
                            </div>
                            <div className="history-body">
                                <p><strong>Diagnosis:</strong> {record.disease?.name}</p>
                                <p><strong>Confidence:</strong> {Math.round(record.confidence * 100)}%</p>
                                <p><strong>Symptoms:</strong> {JSON.parse(record.symptoms).map(s => formatSymptom(s)).join(', ')}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default History;
