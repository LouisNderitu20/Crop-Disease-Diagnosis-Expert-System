import React from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/farmers-tending-crops-stockcake.webp';

const Hero = () => {
    return (
        <section className="hero">
            <div className="hero-content">
                <h1>Diagnose Crop Diseases Accurately</h1>
                <p>Powered by agricultural expert knowledge and rule-based reasoning</p>
                <Link to="/diagnose" className="btn btn-primary">
                    <i className="fas fa-stethoscope"></i> Start Diagnosis
                </Link>
            </div>
            <div className="hero-image">
                <img src={heroImage} alt="Farmer with crops" />
            </div>
        </section>
    );
};

export default Hero;
