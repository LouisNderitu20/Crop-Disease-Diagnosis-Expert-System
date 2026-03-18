import React from 'react';

const Features = () => {
    return (
        <section className="features">
            <h2>Why Use Crop Doctor?</h2>
            <div className="feature-grid">
                <div className="feature-card">
                    <div className="feature-icon"><i className="fas fa-brain"></i></div>
                    <h3>Expert Reasoning</h3>
                    <p>Mimics how agricultural experts diagnose diseases using IF-THEN rules</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon"><i className="fas fa-comments"></i></div>
                    <h3>Interactive Diagnosis</h3>
                    <p>Guided questions to narrow down possibilities step by step</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon"><i className="fas fa-lightbulb"></i></div>
                    <h3>Explainable Results</h3>
                    <p>Shows which symptoms matched and which rules were triggered</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon"><i className="fas fa-leaf"></i></div>
                    <h3>Treatment Advice</h3>
                    <p>Provides recommended treatments and preventive measures</p>
                </div>
            </div>
        </section>
    );
};

export default Features;
