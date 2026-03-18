const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

class BackendInferenceEngine {
    constructor(knowledgeBase) {
        this.knowledgeBase = knowledgeBase;
        this.matchedRules = [];
        this.currentSymptoms = [];
    }

    async diagnose(cropType, userSymptoms, environmentalFactors = {}) {
        try {
            userSymptoms = Array.isArray(userSymptoms) ? userSymptoms : [];
            this.currentSymptoms = userSymptoms;
            this.matchedRules = [];

            const crop = await prisma.crop.findUnique({
                where: { name: cropType },
                include: {
                    rules: {
                        include: { disease: true }
                    }
                }
            });

            if (!crop) return { diagnoses: [], matchedRules: [], summary: { message: 'Crop not found', hasDiagnosis: false } };

            const possibleDiagnoses = [];

            for (const rule of crop.rules) {
                const conditionSymptoms = JSON.parse(rule.conditionSymptoms);
                const conditionEnv = JSON.parse(rule.conditionEnv || '[]');

                const matchResult = this.matchRule(conditionSymptoms, conditionEnv, userSymptoms, environmentalFactors, rule.confidence);

                if (matchResult.matched) {
                    this.matchedRules.push({
                        ruleId: rule.ruleId,
                        matchedSymptoms: matchResult.matchedSymptoms,
                        confidence: matchResult.confidence,
                        disease: rule.disease.name,
                        rule: {
                            id: rule.ruleId,
                            condition: { symptoms: conditionSymptoms },
                            then: { disease: rule.disease.name }
                        }
                    });

                    possibleDiagnoses.push({
                        diseaseId: rule.disease.id,
                        disease: rule.disease.name,
                        confidence: matchResult.confidence,
                        treatment: JSON.parse(rule.disease.treatment),
                        prevention: JSON.parse(rule.disease.prevention),
                        ruleId: rule.ruleId,
                        symptoms: conditionSymptoms
                    });
                }
            }

            possibleDiagnoses.sort((a, b) => b.confidence - a.confidence);

            return {
                diagnoses: possibleDiagnoses,
                matchedRules: this.matchedRules
            };

        } catch (err) {
            console.error('Diagnosis error:', err);
            throw err;
        }
    }

    matchRule(requiredSymptoms, requiredEnv, userSymptoms, userEnv, baseConfidence) {
        const matchedSymptoms = [];
        const totalRequired = requiredSymptoms.length + requiredEnv.length;
        let matchedCount = 0;

        for (const reqSymptom of requiredSymptoms) {
            if (userSymptoms.includes(reqSymptom)) {
                matchedSymptoms.push(reqSymptom);
                matchedCount++;
            }
        }

        for (const reqEnv of requiredEnv) {
            if (userEnv && userEnv[reqEnv] === true) {
                matchedCount++;
            }
        }

        const matchPercentage = totalRequired > 0 ? matchedCount / totalRequired : 0;
        const matched = matchPercentage >= 0.6;
        const confidence = matched ? baseConfidence * matchPercentage : 0;

        return { matched, matchedSymptoms, confidence };
    }
}



app.get('/api/crops', async (req, res) => {
    try {
        const crops = await prisma.crop.findMany({
            include: { symptoms: true }
        });
        res.json(crops);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/diagnose', async (req, res) => {
    const { crop: cropName, symptoms, environmental, userId } = req.body;

    try {
        const engine = new BackendInferenceEngine();
        const result = await engine.diagnose(cropName, symptoms, environmental);

        if (result.diagnoses.length > 0) {
            const top = result.diagnoses[0];
            const crop = await prisma.crop.findUnique({ where: { name: cropName } });

            await prisma.diagnosis.create({
                data: {
                    userId: userId || null,
                    cropId: crop.id,
                    diseaseId: top.diseaseId,
                    confidence: top.confidence,
                    symptoms: JSON.stringify(symptoms)
                }
            });
        }

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/history', async (req, res) => {
    const { userId } = req.query;
    try {
        const history = await prisma.diagnosis.findMany({
            where: { userId: userId ? parseInt(userId) : null },
            include: {
                crop: true,
                disease: true
            },
            orderBy: { date: 'desc' },
            take: 20
        });
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/register', async (req, res) => {
    const { email, password, fullName } = req.body;
    try {
        const user = await prisma.user.create({
            data: { email, password, fullName }
        });
        res.json({ id: user.id, email: user.email, fullName: user.fullName });
    } catch (err) {
        res.status(400).json({ error: 'User already exists or invalid data' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (user && user.password === password) {
            res.json({ id: user.id, email: user.email, fullName: user.fullName });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    try {
        await prisma.$connect();
        console.log('Successfully connected to the database.');
    } catch (error) {
        console.error('FAILED to connect to the database. Make sure your DATABASE_URL in .env is correct and MySQL is running.');
        console.error(error.message);
    }
});
