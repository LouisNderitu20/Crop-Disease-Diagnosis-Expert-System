import React from 'react';

const Settings = () => {
    return (
        <div className="container" style={{padding: '2rem 0'}}>
            <h2 className="diagnosis-name" style={{border: 'none'}}>Settings</h2>
            
            <div className="diagnosis-card" style={{maxWidth: '700px'}}>
                <div className="treatment-section">
                    <h3 style={{color: 'var(--primary-dark)', marginBottom: '1rem'}}><i className="fas fa-shield-alt"></i> Security</h3>
                    <p>Manage your account security and password.</p>
                    <button className="btn btn-secondary">Change Password</button>
                </div>

                <div className="treatment-section">
                    <h3 style={{color: 'var(--primary-dark)', marginBottom: '1rem'}}><i className="fas fa-bell"></i> Notifications</h3>
                    <div className="symptom-option" style={{background: 'none', border: 'none', padding: 0}}>
                        <input type="checkbox" id="notify" defaultChecked />
                        <label htmlFor="notify">Receive email alerts for new crop diseases</label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
