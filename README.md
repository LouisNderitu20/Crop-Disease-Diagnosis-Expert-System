Crop Doctor - Expert System for Crop Disease Diagnosis

Overview

Crop Doctor is a web based expert system designed to help farmers and agricultural professionals diagnose crop diseases based on observed symptoms. The application uses a rule based inference engine to analyze user inputs and provide accurate disease identification along with treatment recommendations and preventive measures.

Features

Core Functionality
- Interactive Diagnosis: Step by step questionnaire to identify crop diseases
- Multi Crop Support: Currently supports Maize, Tomato, Potato and Beans
- Symptom Based Analysis: Users select observed symptoms from crop specific checklists
- Environmental Factors: Optional input for conditions like high humidity or recent rainfall
- Confidence Scoring: Each diagnosis includes a confidence percentage based on symptom matching

Knowledge Management
- Comprehensive Knowledge Base: Contains 10+ disease rules with symptoms, treatments, and prevention strategies
- Educational Content: Provides disease descriptions, historical facts, and learning resources
- Explanation Facility: Detailed breakdown of how each diagnosis was reached

User Features
- Diagnosis History: Automatically saves previous diagnoses for future reference
- Print Reports: Generate printable diagnosis reports
- Knowledge Base Viewer: Browse all disease rules and treatments
- Responsive Design: Works on desktops

Technology Stack

- Frontend: HTML5, CSS3, JavaScript (ES6+)
- Icons: Font Awesome 6
- Storage: LocalStorage for history persistence
- Architecture: Modular JavaScript with separate classes for knowledge base, inference engine and explanation facility

System Components

 1. Knowledge Base (`knowledge-base.js`)
- Contains all crop data, symptoms and disease rules
- Defines 10+ diseases with treatment and prevention recommendations
- Provides helper methods to access crop-specific information

 2. Inference Engine (`inference-engine.js`)
- Core diagnostic logic using forward chaining
- Matches user symptoms against disease rules
- Calculates confidence scores based on symptom overlap
- Supports partial matching (60% threshold for diagnosis)

3. Explanation Facility (`explanation-facility.js`)
- Generates human readable explanations of diagnoses
- Creates educational content about identified diseases
- Formats symptoms and provides detailed rule breakdowns

4. Main Application (`main.js`)
- Handles UI interactions and form submissions
- Manages diagnosis workflow
- Displays results and history
- Provides utility functions for alerts and loading states

Supported Crops and Diseases

Maize
- Maize Lethal Necrosis
- Northern Leaf Blight
- Stalk Rot

Tomato
- Tomato Bacterial Wilt
- Tomato Late Blight
- Tomato Yellow Leaf Curl Virus

Potato
- Potato Late Blight
- Potato Bacterial Soft Rot

Beans
- Bean Rust
- Bean Angular Leaf Spot

Installation and Setup

1. Clone or download the repository
2. Ensure the following folder structure:
```
crop-doctor/
├── index.html
├── pages/
│   ├── diagnose.html
│   ├── history.html
│   └── knowledge-base.html
├── css/
│   └── style.css
├── js/
│   ├── knowledge-base.js
│   ├── inference-engine.js
│   ├── explanation-facility.js
│   └── main.js
└── images/
    └── (crop images)
```

3. Open `index.html` in a modern web browser
4. No server or database required - runs entirely in the browser

Usage Guide

Diagnosing a Crop
1. Navigate to "Diagnose Crop" page
2. Select your crop type from the dropdown
3. Check all observed symptoms from the generated list
4. (Optional) Select relevant environmental factors
5. Click "Get Diagnosis" to receive results
6. View detailed diagnosis with treatment recommendations

Viewing History
Access previous diagnoses from the "Diagnosis History" page
Each entry shows date, crop, diagnosis, and confidence level
Option to clear history

Exploring Knowledge Base
Browse all disease rules organized by crop
View symptoms, confidence levels and treatment recommendations

Customization

Adding New Crops
1. Add crop to `KnowledgeBase.crops` array
2. Define symptoms in `KnowledgeBase.symptoms[crop]`
3. Create disease rules in `KnowledgeBase.rules` with appropriate crop value
4. Update UI elements if needed

Adding New Diseases
```javascript
{
    id: 'rule_xxx',
    crop: 'crop_name',
    condition: { 
        symptoms: ['symptom_id1', 'symptom_id2'],
        environmental: ['factor_name']
    },
    then: {
        disease: 'Disease Name',
        confidence: 0.85,
        treatment: ['Treatment step 1', 'Treatment step 2'],
        prevention: ['Prevention step 1', 'Prevention step 2']
    }
}
```

Browser Support

- Chrome (recommended)
- Firefox
- Edge
- Opera

Limitations

- Currently supports only 4 crops with 10 diseases
- No multilingual support (English only)
- Limited to rule based inference (no machine learning)
- Environmental factors are optional and may affect accuracy
- History storage limited to browser localStorage (20 entries max)

Future Enhancements

1. Add more crops and diseases
2. Implement image recognition for symptom identification
3. Add multilingual support
4. Include weather data API integration
5. Develop mobile app version
6. Add expert consultation feature
7. Implement user accounts for cloud history storage

