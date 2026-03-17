import React from 'react';
import maizeImg from '../assets/Maize.png';
import tomatoImg from '../assets/tomatoes_helios4eos_gettyimages-edit.jpg';
import potatoImg from '../assets/GettyImages-1224918845-e1658929817975.jpg';
import beanImg from '../assets/four-bowls-of-beans-thumb.avif';

const SupportedCrops = () => {
    const crops = [
        { name: 'Maize', img: maizeImg },
        { name: 'Tomatoes', img: tomatoImg },
        { name: 'Potatoes', img: potatoImg },
        { name: 'Beans', img: beanImg }
    ];

    return (
        <section className="supported-crops">
            <h2>Supported Crops</h2>
            <div className="crop-grid">
                {crops.map((crop, index) => (
                    <div key={index} className="crop-item">
                        <img src={crop.img} alt={crop.name} />
                        <span>{crop.name}</span>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default SupportedCrops;
