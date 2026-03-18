// knowledge-base.js
const KnowledgeBase = {
    crops: ['maize', 'tomato', 'potato', 'beans'],

    symptoms: {
        maize: [
            { id: 'yellow_leaves', description: 'Yellow leaves' },
            { id: 'brown_spots', description: 'Brown spots on leaves' },
            { id: 'wilting', description: 'Wilting plants' },
            { id: 'stunted_growth', description: 'Stunted growth' },
            { id: 'holes_leaves', description: 'Holes in leaves' },
            { id: 'white_powder', description: 'White powder on leaves' },
            { id: 'rotten_stem', description: 'Rotten stem base' },
            { id: 'curled_leaves', description: 'Curled leaves' },
            { id: 'insects_present', description: 'Insects present' },
            { id: 'high_humidity', description: 'High humidity conditions' }
        ],
        tomato: [
            { id: 'yellow_leaves', description: 'Yellow leaves' },
            { id: 'dark_spots', description: 'Dark spots on leaves' },
            { id: 'fruit_rot', description: 'Fruit rot' },
            { id: 'wilting', description: 'Wilting' },
            { id: 'leaf_curling', description: 'Leaf curling' }
        ],
        potato: [
            { id: 'yellow_leaves', description: 'Yellow leaves' },
            { id: 'brown_lesions', description: 'Brown lesions' },
            { id: 'tuber_rot', description: 'Tuber rot' },
            { id: 'wilting', description: 'Wilting' }
        ],
        beans: [
            { id: 'yellow_leaves', description: 'Yellow leaves' },
            { id: 'rust_pustules', description: 'Rust-colored pustules' },
            { id: 'leaf_spot', description: 'Leaf spots' },
            { id: 'stunted', description: 'Stunted growth' }
        ]
    },

    rules: [
        {
            id: 'rule_001',
            crop: 'maize',
            condition: { symptoms: ['yellow_leaves', 'stunted_growth', 'insects_present'], environmental: ['high_humidity'] },
            then: {
                disease: 'Maize Lethal Necrosis',
                confidence: 0.85,
                treatment: [
                    'Remove and destroy infected plants',
                    'Use certified disease-free seeds',
                    'Control insect vectors with appropriate pesticides',
                    'Practice crop rotation with non-host crops'
                ],
                prevention: [
                    'Plant resistant varieties',
                    'Control weeds that may harbor insects',
                    'Avoid planting during peak insect seasons'
                ]
            }
        },
        {
            id: 'rule_002',
            crop: 'maize',
            condition: { symptoms: ['brown_spots', 'white_powder', 'high_humidity'] },
            then: {
                disease: 'Northern Leaf Blight',
                confidence: 0.9,
                treatment: [
                    'Apply fungicides containing triazoles or strobilurins',
                    'Remove infected leaves',
                    'Improve air circulation by proper spacing'
                ],
                prevention: [
                    'Plant resistant varieties',
                    'Practice crop rotation',
                    'Avoid overhead irrigation'
                ]
            }
        },
        {
            id: 'rule_003',
            crop: 'maize',
            condition: { symptoms: ['rotten_stem', 'wilting', 'yellow_leaves'] },
            then: {
                disease: 'Stalk Rot',
                confidence: 0.8,
                treatment: [
                    'Improve drainage',
                    'Avoid excessive nitrogen fertilizer',
                    'Apply appropriate fungicides to soil'
                ],
                prevention: [
                    'Practice crop rotation',
                    'Use disease-free seeds',
                    'Maintain proper plant spacing'
                ]
            }
        },
        {
            id: 'rule_004',
            crop: 'tomato',
            condition: { symptoms: ['yellow_leaves', 'wilting', 'dark_spots'] },
            then: {
                disease: 'Tomato Bacterial Wilt',
                confidence: 0.85,
                treatment: [
                    'Remove and destroy infected plants',
                    'Apply copper-based bactericides',
                    'Improve soil drainage'
                ],
                prevention: [
                    'Use resistant varieties',
                    'Practice crop rotation with non-solanaceous crops',
                    'Solarize soil before planting'
                ]
            }
        },
        {
            id: 'rule_005',
            crop: 'tomato',
            condition: { symptoms: ['dark_spots', 'fruit_rot', 'high_humidity'] },
            then: {
                disease: 'Tomato Late Blight',
                confidence: 0.9,
                treatment: [
                    'Apply fungicides (chlorothalonil, mancozeb)',
                    'Remove infected fruits and leaves',
                    'Improve air circulation'
                ],
                prevention: [
                    'Plant resistant varieties',
                    'Avoid overhead watering',
                    'Space plants properly'
                ]
            }
        },
        {
            id: 'rule_006',
            crop: 'tomato',
            condition: { symptoms: ['leaf_curling', 'stunted_growth', 'insects_present'] },
            then: {
                disease: 'Tomato Yellow Leaf Curl Virus',
                confidence: 0.85,
                treatment: [
                    'Control whitefly vectors with insecticides',
                    'Remove infected plants',
                    'Use reflective mulches'
                ],
                prevention: [
                    'Use resistant varieties',
                    'Install insect-proof nets',
                    'Monitor and control whiteflies early'
                ]
            }
        },
        {
            id: 'rule_007',
            crop: 'potato',
            condition: { symptoms: ['yellow_leaves', 'brown_lesions', 'wilting', 'high_humidity'] },
            then: {
                disease: 'Potato Late Blight',
                confidence: 0.95,
                treatment: [
                    'Apply fungicides (metalaxyl, mancozeb)',
                    'Destroy infected plants',
                    'Harvest immediately if tubers are mature'
                ],
                prevention: [
                    'Use certified disease-free seed potatoes',
                    'Plant resistant varieties',
                    'Avoid overhead irrigation'
                ]
            }
        },
        {
            id: 'rule_008',
            crop: 'potato',
            condition: { symptoms: ['yellow_leaves', 'tuber_rot', 'wilting'] },
            then: {
                disease: 'Potato Bacterial Soft Rot',
                confidence: 0.8,
                treatment: [
                    'Remove infected plants',
                    'Improve soil drainage',
                    'Store tubers in cool, dry conditions'
                ],
                prevention: [
                    'Use disease-free seed potatoes',
                    'Avoid wounding tubers during harvest',
                    'Practice crop rotation'
                ]
            }
        },
        {
            id: 'rule_009',
            crop: 'beans',
            condition: { symptoms: ['rust_pustules', 'yellow_leaves', 'high_humidity'] },
            then: {
                disease: 'Bean Rust',
                confidence: 0.9,
                treatment: [
                    'Apply fungicides (sulfur, chlorothalonil)',
                    'Remove infected leaves',
                    'Improve air circulation'
                ],
                prevention: [
                    'Plant resistant varieties',
                    'Avoid overhead watering',
                    'Space plants properly'
                ]
            }
        },
        {
            id: 'rule_010',
            crop: 'beans',
            condition: { symptoms: ['leaf_spot', 'yellow_leaves', 'wilting'] },
            then: {
                disease: 'Bean Angular Leaf Spot',
                confidence: 0.85,
                treatment: [
                    'Apply copper-based bactericides',
                    'Remove infected plant debris',
                    'Practice crop rotation'
                ],
                prevention: [
                    'Use disease-free seeds',
                    'Avoid working in wet fields',
                    'Plant in well-drained soil'
                ]
            }
        }
    ],

    generalAdvice: {
        maize: 'Maize requires adequate nitrogen. Yellowing may indicate nitrogen deficiency.',
        tomato: 'Tomatoes need consistent watering. Fluctuations can cause blossom end rot.',
        potato: 'Potatoes are susceptible to soil-borne diseases. Rotate crops every 2-3 years.',
        beans: 'Beans fix their own nitrogen. Avoid excess nitrogen fertilizer.'
    },

    getRulesForCrop: function(cropType) {
        return this.rules.filter(rule => rule.crop === cropType);
    },

    getSymptomsForCrop: function(cropType) {
        return this.symptoms[cropType] || [];
    },

    addRule: function(newRule) {
        this.rules.push(newRule);
        return true;
    },

    updateRule: function(ruleId, updatedRule) {
        const index = this.rules.findIndex(rule => rule.id === ruleId);
        if (index !== -1) {
            this.rules[index] = updatedRule;
            return true;
        }
        return false;
    }
};

export default KnowledgeBase;