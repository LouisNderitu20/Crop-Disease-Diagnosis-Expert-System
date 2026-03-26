import React from 'react';

const Help = () => {
    return (
        <div className="container" style={{padding: '2rem 0'}}>
            <h2 className="diagnosis-name" style={{border: 'none'}}>Help & Tutorial</h2>
            
            <div className="knowledge-base">
                <div className="crop-section">
                    <h3><i className="fas fa-info-circle"></i> About Global Crop Doctor</h3>
                    <p>Crop Doctor is an expert system designed to help farmers identify and treat crop diseases quickly and accurately.</p>
                </div>

                <div className="crop-section">
                    <h3><i className="fas fa-book"></i> How to use</h3>
                    <ul style={{paddingLeft: '1.5rem'}}>
                        <li>Navigate to the "Diagnose" page.</li>
                        <li>Select your crop type.</li>
                        <li>Select the symptoms you observe.</li>
                        <li>Add environmental factors if applicable.</li>
                        <li>Click "Diagnose Now" to see the results and treatment advice.</li>
                    </ul>
                </div>

                <div className="crop-section">
                    <h3><i className="fas fa-question-circle"></i> FAQ</h3>
                    <p><strong>Is this accurate?</strong> The system uses a rule-based inference engine that is continuously updated by experts.</p>
                    <p><strong>Is it free?</strong> Yes, the basic diagnosis tool is free for all farmers.</p>
                </div>
            </div>
        </div>
    );
};

export default Help;
