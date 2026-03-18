import React from 'react';

const Footer = () => {
    return (
        <footer>
            <div className="container">
                <p>&copy; {new Date().getFullYear()} Crop Doctor - Expert System for Crop Disease Diagnosis</p>
            </div>
        </footer>
    );
};

export default Footer;
