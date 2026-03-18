import React from 'react';

const HowItWorks = () => {
    const steps = [
        { 
            number: 1, 
            title: 'Select Crop', 
            description: 'Choose your crop type (maize, tomato, potato or beans)' 
        },
        { 
            number: 2, 
            title: 'Describe Symptoms', 
            description: 'Answer guided questions about leaf color, spots, stem condition' 
        },
        { 
            number: 3, 
            title: 'Get Diagnosis', 
            description: 'Receive probable disease with treatment recommendations' 
        },
        { 
            number: 4, 
            title: 'Learn Why', 
            description: 'View explanation of reasoning and triggered rules' 
        }
    ];

    return (
        <section className="how-it-works">
            <h2>How It Works</h2>
            <div className="steps">
                {steps.map((step, index) => (
                    <div key={index} className="step">
                        <div className="step-number">{step.number}</div>
                        <h3>{step.title}</h3>
                        <p>{step.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default HowItWorks;
