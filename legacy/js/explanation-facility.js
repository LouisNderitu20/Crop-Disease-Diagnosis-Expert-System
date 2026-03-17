// explanation-facility.js
class ExplanationFacility {
    constructor() {
        this.explanationHistory = [];
    }

    generateExplanation(diagnosisResult, userInput) {
        const explanation = {
            timestamp: new Date().toISOString(),
            userInput: userInput,
            diagnosis: diagnosisResult,
            summary: this.createSummary(diagnosisResult),
            detailed: this.createDetailedExplanation(diagnosisResult),
            educational: this.createEducationalContent(diagnosisResult)
        };

        this.explanationHistory.push(explanation);
        return explanation;
    }

    createSummary(diagnosisResult) {
        if (diagnosisResult.diagnoses.length === 0) {
            return {
                title: 'No Specific Disease Identified',
                message: 'The symptoms provided do not match any specific disease in our knowledge base. This could be due to:',
                points: [
                    'Nutrient deficiency in the soil',
                    'Environmental stress (drought or waterlogging)',
                    'Pest damage without disease',
                    'A rare disease not yet in our database'
                ],
                nextSteps: [
                    'Consult a local agricultural extension officer',
                    'Take photos of affected plants for expert review',
                    'Consider soil testing for nutrient levels'
                ]
            };
        }

        const topDiagnosis = diagnosisResult.diagnoses[0];
        const matchedRule = diagnosisResult.matchedRules.find(
            r => r.rule.then.disease === topDiagnosis.disease
        );

        return {
            title: `Diagnosis: ${topDiagnosis.disease}`,
            message: `Based on the symptoms you described, our expert system has identified ${topDiagnosis.disease} as the most likely problem.`,
            confidence: `Confidence Level: ${Math.round(topDiagnosis.confidence * 100)}%`,
            matchedSymptoms: matchedRule ? matchedRule.matchedSymptoms : [],
            ruleExplanation: this.explainRule(matchedRule)
        };
    }

    createDetailedExplanation(diagnosisResult) {
        let explanation = '=== DETAILED DIAGNOSIS REPORT ===\n\n';

        explanation += 'INPUT SYMPTOMS:\n';
        if (diagnosisResult.matchedRules && diagnosisResult.matchedRules.length > 0) {
            const allMatchedSymptoms = [];
            diagnosisResult.matchedRules.forEach(match => {
                allMatchedSymptoms.push(...match.matchedSymptoms);
            });
            explanation += [...new Set(allMatchedSymptoms)].map(s => this.formatSymptom(s)).join('\n');
        } else {
            explanation += 'No symptoms matched';
        }
        explanation += '\n\n';

        explanation += 'TRIGGERED RULES:\n';
        if (diagnosisResult.matchedRules && diagnosisResult.matchedRules.length > 0) {
            for (const match of diagnosisResult.matchedRules) {
                explanation += `\nRule ID: ${match.rule.id}\n`;
                explanation += `Rule: IF ${match.rule.condition.symptoms.join(' AND ')} THEN ${match.rule.then.disease}\n`;
                explanation += `Matched Symptoms: ${match.matchedSymptoms.map(s => this.formatSymptom(s)).join(', ')}\n`;
                explanation += `Confidence: ${Math.round(match.confidence * 100)}%\n`;
                explanation += '-'.repeat(40) + '\n';
            }
        } else {
            explanation += 'No rules were triggered\n';
        }

        if (diagnosisResult.diagnoses && diagnosisResult.diagnoses.length > 1) {
            explanation += '\nALTERNATIVE POSSIBILITIES:\n';
            for (let i = 1; i < Math.min(3, diagnosisResult.diagnoses.length); i++) {
                const alt = diagnosisResult.diagnoses[i];
                explanation += `${i}. ${alt.disease} (${Math.round(alt.confidence * 100)}% confidence)\n`;
            }
        }

        return explanation;
    }

    createEducationalContent(diagnosisResult) {
        if (!diagnosisResult.diagnoses || diagnosisResult.diagnoses.length === 0) {
            return {
                topic: 'General Crop Health',
                tips: [
                    'Healthy crops need proper nutrition, water, and care',
                    'Regular monitoring helps catch problems early',
                    'Maintain good field hygiene to prevent diseases',
                    'Learn to recognize common pests and beneficial insects'
                ]
            };
        }

        const topDiagnosis = diagnosisResult.diagnoses[0];

        return {
            topic: `Learning About ${topDiagnosis.disease}`,
            description: this.getDiseaseDescription(topDiagnosis.disease),
            symptoms: topDiagnosis.symptoms ? 'Watch for: ' + topDiagnosis.symptoms : '',
            management: {
                treatment: topDiagnosis.treatment || [],
                prevention: topDiagnosis.prevention || []
            },
            facts: this.getDiseaseFacts(topDiagnosis.disease)
        };
    }

    explainRule(matchedRule) {
        if (!matchedRule) return '';

        const rule = matchedRule.rule;
        const matched = matchedRule.matchedSymptoms;
        const missing = rule.condition.symptoms.filter(s => !matched.includes(s));

        let explanation = `Our system identified ${rule.then.disease} because:\n\n`;

        explanation += '✓ Symptoms you reported that match this disease:\n';
        if (matched.length > 0) {
            matched.forEach(s => explanation += `  • ${this.formatSymptom(s)}\n`);
        } else {
            explanation += '  • No matching symptoms reported\n';
        }

        if (missing.length > 0) {
            explanation += '\n⚠ Symptoms of this disease you did not report:\n';
            missing.forEach(s => explanation += `  • ${this.formatSymptom(s)}\n`);
        }

        explanation += `\nConfidence: ${Math.round(matchedRule.confidence * 100)}%`;

        return explanation;
    }

    formatSymptom(symptomId) {
        const symptomMap = {
            'yellow_leaves': 'Yellow or discolored leaves',
            'brown_spots': 'Brown spots on leaves',
            'wilting': 'Plants wilting during the day',
            'stunted_growth': 'Plants are smaller than normal',
            'holes_leaves': 'Holes or damage in leaves',
            'white_powder': 'White powdery substance on leaves',
            'rotten_stem': 'Rotting at the base of the stem',
            'curled_leaves': 'Leaves curling or distorting',
            'insects_present': 'Visible insects on plants',
            'high_humidity': 'High humidity or wet conditions',
            'dark_spots': 'Dark spots on leaves',
            'fruit_rot': 'Fruit rot',
            'leaf_curling': 'Leaf curling',
            'brown_lesions': 'Brown lesions',
            'tuber_rot': 'Tuber rot',
            'rust_pustules': 'Rust-colored pustules',
            'leaf_spot': 'Leaf spots',
            'stunted': 'Stunted growth'
        };

        return symptomMap[symptomId] || symptomId.replace(/_/g, ' ');
    }

    getDiseaseDescription(diseaseName) {
        const descriptions = {
            'Maize Lethal Necrosis': 'A viral disease that affects maize, causing yellowing and death of plants. It is spread by insects like thrips and aphids.',
            'Northern Leaf Blight': 'A fungal disease causing long, gray-green lesions on leaves. It thrives in cool, wet conditions.',
            'Stalk Rot': 'Fungal disease causing rotting of maize stalks, leading to lodging and yield loss.',
            'Tomato Bacterial Wilt': 'Bacterial disease causing rapid wilting and death of tomato plants.',
            'Tomato Late Blight': 'Serious fungal disease affecting tomatoes, causing dark lesions on leaves and fruit rot.',
            'Tomato Yellow Leaf Curl Virus': 'Viral disease spread by whiteflies, causing stunting and leaf curling.',
            'Potato Late Blight': 'Historic fungal disease that caused the Irish Potato Famine. Affects leaves and tubers.',
            'Potato Bacterial Soft Rot': 'Bacterial disease causing soft rotting of potato tubers.',
            'Bean Rust': 'Fungal disease causing rust-colored pustules on bean leaves.',
            'Bean Angular Leaf Spot': 'Bacterial disease causing angular spots on bean leaves.'
        };

        return descriptions[diseaseName] || 'A common crop disease affecting yields and quality.';
    }

    getDiseaseFacts(diseaseName) {
        const facts = {
            'Maize Lethal Necrosis': 'Fact: MLN was first reported in Kenya in 2011 and has since become a major constraint to maize production.',
            'Northern Leaf Blight': 'Fact: This disease can reduce yields by up to 50% if not controlled early.',
            'Potato Late Blight': 'Fact: This disease caused the Irish Potato Famine in the 1840s, leading to mass starvation.',
            'Tomato Late Blight': 'Fact: This is the same pathogen that causes potato late blight.',
            'Bean Rust': 'Fact: Rust fungi have complex life cycles and can produce millions of spores from a single infection.'
        };

        return facts[diseaseName] || 'Early detection and proper management are key to controlling this disease.';
    }

    saveExplanation(explanation) {
        localStorage.setItem('lastDiagnosis', JSON.stringify(explanation));

        const history = this.getExplanationHistory();
        history.push(explanation);
        localStorage.setItem('diagnosisHistory', JSON.stringify(history));
    }

    getExplanationHistory() {
        const history = localStorage.getItem('diagnosisHistory');
        return history ? JSON.parse(history) : [];
    }

    clearHistory() {
        localStorage.removeItem('diagnosisHistory');
        this.explanationHistory = [];
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExplanationFacility;
} else {
    window.ExplanationFacility = ExplanationFacility;
}