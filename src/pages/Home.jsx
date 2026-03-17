import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import SupportedCrops from '../components/SupportedCrops';
import HowItWorks from '../components/HowItWorks';

const Home = () => {
    return (
        <div className="home-page">
            <Hero />
            <Features />
            <SupportedCrops />
            <HowItWorks />
        </div>
    );
};

export default Home;
