class InferenceEngine {
    constructor(knowledgeBase) {
        this.knowledgeBase = knowledgeBase;
        this.matchedRules = [];
        this.currentSymptoms = [];
    }

    diagnose(cropType, userSymptoms, environmentalFactors = {}) {
        try {
            userSymptoms = Array.isArray(userSymptoms) ? userSymptoms : [];
            environmentalFactors = environmentalFactors || {};

            this.currentSymptoms = userSymptoms;
            this.matchedRules = [];

            const cropRules = this.knowledgeBase.getRulesForCrop(cropType) || [];
            const possibleDiagnoses = [];

            for (const rule of cropRules) {
                const matchResult = this.matchRule(rule, userSymptoms, environmentalFactors);

                if (matchResult.matched) {
                    this.matchedRules.push({
                        rule: rule,
                        matchedSymptoms: matchResult.matchedSymptoms,
                        confidence: matchResult.confidence
                    });

                    possibleDiagnoses.push({
                        disease: rule.then.disease,
                        confidence: matchResult.confidence,
                        treatment: rule.then.treatment || [],
                        prevention: rule.then.prevention || [],
                        ruleId: rule.id,
                        symptoms: rule.condition.symptoms || []
                    });
                }
            }

            possibleDiagnoses.sort((a, b) => b.confidence - a.confidence);

            return {
                diagnoses: possibleDiagnoses,
                matchedRules: this.matchedRules,
                summary: this.generateSummary(possibleDiagnoses)
            };

        } catch (err) {
            console.error('Diagnosis error:', err);
            return {
                diagnoses: [],
                matchedRules: [],
                summary: {
                    message: 'An error occurred during diagnosis. Please try again.',
                    hasDiagnosis: false
                }
            };
        }
    }

    matchRule(rule, userSymptoms, environmentalFactors) {
        try {
            const requiredSymptoms = rule.condition.symptoms || [];
            const requiredEnvironmental = rule.condition.environmental || [];
            
            const matchedSymptoms = [];
            const totalRequired = requiredSymptoms.length + requiredEnvironmental.length;
            let matchedCount = 0;

            for (const reqSymptom of requiredSymptoms) {
                if (userSymptoms.includes(reqSymptom)) {
                    matchedSymptoms.push(reqSymptom);
                    matchedCount++;
                }
            }

            for (const reqEnv of requiredEnvironmental) {
                if (environmentalFactors && environmentalFactors[reqEnv] === true) {
                    matchedCount++;
                }
            }

            const matchPercentage = totalRequired > 0 ? matchedCount / totalRequired : 0;
            const matched = matchPercentage >= 0.6;
            const confidence = matched ? (rule.then.confidence || 0.5) * matchPercentage : 0;

            return {
                matched,
                matchedSymptoms,
                confidence,
                matchPercentage
            };
        } catch (err) {
            console.error('Error matching rule:', rule?.id, err);
            return { matched: false, matchedSymptoms: [], confidence: 0, matchPercentage: 0 };
        }
    }

    generateSummary(possibleDiagnoses) {
        if (!possibleDiagnoses || possibleDiagnoses.length === 0) {
            return {
                message: 'No matching diseases found. Please consult an agricultural expert.',
                hasDiagnosis: false
            };
        }

        const topDiagnosis = possibleDiagnoses[0];
        if (!topDiagnosis) {
            return {
                message: 'No matching diseases found. Please consult an agricultural expert.',
                hasDiagnosis: false
            };
        }

        return {
            message: `Based on the symptoms provided, the most likely diagnosis is ${topDiagnosis.disease} with ${Math.round(topDiagnosis.confidence * 100)}% confidence.`,
            hasDiagnosis: true,
            topDiagnosis
        };
    }

    getExplanation() {
        if (this.matchedRules.length === 0) {
            return 'No rules were triggered. Please provide more specific symptoms.';
        }

        let explanation = 'Diagnosis Process:\n\n';
        explanation += 'Symptoms analyzed:\n';
        explanation += this.currentSymptoms.map(s => `- ${s}`).join('\n');
        explanation += '\n\nRules triggered:\n';

        for (const match of this.matchedRules) {
            explanation += `\nRule: ${match.rule.id}\n`;
            explanation += `IF: ${match.rule.condition.symptoms.join(' AND ')}\n`;
            explanation += `THEN: ${match.rule.then.disease}\n`;
            explanation += `Confidence: ${Math.round(match.confidence * 100)}%\n`;
        }

        return explanation;
    }

    askClarifyingQuestions(currentSymptoms, possibleDiagnoses) {
        if (possibleDiagnoses.length > 0) {
            const topDiagnosis = possibleDiagnoses[0];
            const matchedRule = this.matchedRules.find(m => m.rule.then.disease === topDiagnosis.disease);

            if (matchedRule) {
                const missingSymptoms = matchedRule.rule.condition.symptoms.filter(
                    s => !currentSymptoms.includes(s)
                );

                if (missingSymptoms.length > 0) {
                    return {
                        question: `To confirm ${topDiagnosis.disease}, please check if you observe these symptoms:`,
                        symptoms: missingSymptoms,
                        type: 'confirmation'
                    };
                }
            }
        }

        return null;
    }
}

export default InferenceEngine;