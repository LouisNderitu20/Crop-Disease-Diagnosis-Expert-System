const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const multer = require('multer');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

// Winston logger setup
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.set('trust proxy', 1); // Trust first proxy (e.g. for dev server)
app.use(limiter);
app.use(cors());
app.use(express.json());

// RBAC Middleware
const authorize = (roles = []) => {
    return (req, res, next) => {
        const userRole = req.headers['x-user-role']; 
        if (roles.length && (!userRole || !roles.includes(userRole.toUpperCase()))) {
            console.warn(`Unauthorized access attempt. Roles required: ${roles}, Role provided: ${userRole}`);
            return res.status(403).json({ error: 'Unauthorized: Access denied' });
        }
        next();
    };
};

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
        const matched = matchPercentage >= 0.4; // Lowered threshold to see more potential matches
        const confidence = matched ? baseConfidence * matchPercentage : 0;

        return { matched, matchedSymptoms, confidence };
    }

    getClarifyingQuestions(possibleDiagnoses, currentSymptoms) {
        const suggestedSymptoms = new Set();
        possibleDiagnoses.forEach(d => {
            d.symptoms.forEach(s => {
                if (!currentSymptoms.includes(s)) {
                    suggestedSymptoms.add(s);
                }
            });
        });
        return Array.from(suggestedSymptoms).slice(0, 3); // Return top 3 suggested symptoms
    }
}

// Multer setup for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });



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

app.post('/api/diagnose', upload.single('image'), async (req, res) => {
    const { crop: cropName, symptoms: symptomsRaw, environmental: environmentalRaw, userId } = req.body;
    const symptoms = JSON.parse(symptomsRaw || '[]');
    const environmental = JSON.parse(environmentalRaw || '{}');
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const engine = new BackendInferenceEngine();
        const result = await engine.diagnose(cropName, symptoms, environmental);

        let clarifyingQuestions = [];
        if (result.diagnoses.length > 0 && result.diagnoses[0].confidence < 0.7) {
            clarifyingQuestions = engine.getClarifyingQuestions(result.diagnoses, symptoms);
        }

        let diagnosisId = null;
        if (result.diagnoses.length > 0) {
            const top = result.diagnoses[0];
            const crop = await prisma.crop.findUnique({ where: { name: cropName } });
            
            if (crop) {
                // Check if user exists to avoid foreign key violation
                let validUserId = null;
                const parsedUserId = parseInt(userId);
                if (!isNaN(parsedUserId)) {
                    try {
                        const userExists = await prisma.user.findUnique({ where: { id: parsedUserId } });
                        if (userExists) validUserId = userExists.id;
                    } catch (e) {
                        logger.error(`User check error: ${e.message}`);
                        validUserId = null;
                    }
                }

                const diagnosis = await prisma.diagnosis.create({
                    data: {
                        userId: validUserId,
                        cropId: crop.id,
                        diseaseId: top.diseaseId,
                        confidence: top.confidence,
                        symptoms: JSON.stringify(symptoms),
                        image: imagePath
                    }
                });
                diagnosisId = diagnosis.id;
            } else {
                logger.warn(`Diagnosis created but crop '${cropName}' not found in DB`);
            }
        }

        res.json({ ...result, diagnosisId, clarifyingQuestions });
    } catch (err) {
        logger.error(`Diagnosis error: ${err.message}`);
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
    const { email, password, fullName, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { 
                email, 
                password: hashedPassword, 
                fullName,
                role: role || 'FARMER'
            }
        });
        logger.info(`User registered: ${email}`);
        res.json({ id: user.id, email: user.email, fullName: user.fullName, role: user.role, createdAt: user.createdAt });
    } catch (err) {
        logger.error(`Registration error: ${err.message}`);
        res.status(400).json({ error: 'User already exists or invalid data' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (user && await bcrypt.compare(password, user.password)) {
            // Update last login
            await prisma.user.update({
                where: { id: user.id },
                data: { lastLogin: new Date() }
            });
            
            logger.info(`User logged in: ${email}`);
            res.json({ id: user.id, email: user.email, fullName: user.fullName, role: user.role, createdAt: user.createdAt });
        } else {
            logger.warn(`Failed login attempt: ${email}`);
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        logger.error(`Login error: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

// Password Reset Request (Forgot Password)
app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // In a real system, we'd send an email. Here we log a mock key to console.
        const resetKey = Math.floor(100000 + Math.random() * 900000).toString();
        logger.info(`PASSWORD RESET REQUEST for ${email}. RESET KEY: ${resetKey}`);
        console.log(`\n\n[MOCK EMAIL] To: ${email}\nYour password reset key is: ${resetKey}\n\n`);

        // Store resetKey in memory (or better, in DB - for this demo, let's keep it simple)
        // We'll use a hack: store it in a temporary object if not changing schema
        global.resetKeys = global.resetKeys || {};
        global.resetKeys[email] = resetKey;

        res.json({ message: 'Reset instructions shown in server console.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Password Reset (Verify Key)
app.post('/api/auth/reset-password', async (req, res) => {
    const { email, resetKey, newPassword } = req.body;
    try {
        if (!global.resetKeys || global.resetKeys[email] !== resetKey) {
            return res.status(400).json({ error: 'Invalid or expired reset key' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });

        delete global.resetKeys[email];
        res.json({ message: 'Password reset successful' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.use('/uploads', express.static('public/uploads'));

// Admin: Diseases CRUD
app.get('/api/admin/diseases', authorize(['ADMIN']), async (req, res) => {
    try {
        const diseases = await prisma.disease.findMany();
        res.json(diseases);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/diseases', authorize(['ADMIN']), async (req, res) => {
    const { name, description, treatment, prevention } = req.body;
    try {
        const disease = await prisma.disease.create({
            data: { 
                name, 
                description, 
                treatment: JSON.stringify(treatment), 
                prevention: JSON.stringify(prevention) 
            }
        });
        res.json(disease);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/admin/diseases/:id', authorize(['ADMIN']), async (req, res) => {
    const { id } = req.params;
    const { name, description, treatment, prevention } = req.body;
    try {
        const disease = await prisma.disease.update({
            where: { id: parseInt(id) },
            data: { 
                name, 
                description, 
                treatment: JSON.stringify(treatment), 
                prevention: JSON.stringify(prevention) 
            }
        });
        res.json(disease);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/diseases/:id', authorize(['ADMIN']), async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.disease.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Disease deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Rules CRUD
app.get('/api/admin/rules', authorize(['ADMIN']), async (req, res) => {
    try {
        const rules = await prisma.rule.findMany({
            include: { crop: true, disease: true }
        });
        res.json(rules);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/rules', authorize(['ADMIN']), async (req, res) => {
    const { ruleId, cropId, diseaseId, conditionSymptoms, conditionEnv, confidence } = req.body;
    try {
        // Simple conflict detection: Check if a rule with same symptoms and crop exists
        const existing = await prisma.rule.findFirst({
            where: {
                cropId: parseInt(cropId),
                conditionSymptoms: JSON.stringify(conditionSymptoms)
            }
        });

        if (existing) {
            return res.status(400).json({ error: 'Conflict detected: A rule with these symptoms already exists for this crop.' });
        }

        const rule = await prisma.rule.create({
            data: {
                ruleId,
                cropId: parseInt(cropId),
                diseaseId: parseInt(diseaseId),
                conditionSymptoms: JSON.stringify(conditionSymptoms),
                conditionEnv: JSON.stringify(conditionEnv || []),
                confidence: parseFloat(confidence)
            }
        });
        res.json(rule);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Stats & Analytics
app.get('/api/admin/stats', authorize(['ADMIN']), async (req, res) => {
    try {
        const totalUsers = await prisma.user.count();
        const totalDiagnoses = await prisma.diagnosis.count();
        const diseaseStats = await prisma.diagnosis.groupBy({
            by: ['diseaseId'],
            _count: { diseaseId: true },
            orderBy: { _count: { diseaseId: 'desc' } },
            take: 5
        });

        const diseases = await Promise.all(diseaseStats.map(async (s) => {
            const d = await prisma.disease.findUnique({ where: { id: s.diseaseId } });
            return { name: d.name, count: s._count.diseaseId };
        }));

        res.json({ totalUsers, totalDiagnoses, topDiseases: diseases });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: User List
app.get('/api/admin/users', authorize(['ADMIN']), async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, email: true, fullName: true, role: true, createdAt: true, lastLogin: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/admin/users/:id/reset-password', authorize(['ADMIN']), async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: parseInt(id) },
            data: { password: hashedPassword }
        });
        res.json({ message: 'User password reset successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Feedback List
app.get('/api/admin/feedback', authorize(['ADMIN']), async (req, res) => {
    try {
        const feedback = await prisma.feedback.findMany({
            include: {
                user: { select: { fullName: true, email: true } },
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(feedback);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Full Diagnosis List
app.get('/api/admin/diagnoses', authorize(['ADMIN']), async (req, res) => {
    try {
        const diagnoses = await prisma.diagnosis.findMany({
            include: {
                user: { select: { fullName: true, email: true } },
                crop: true,
                disease: true
            },
            orderBy: { date: 'desc' }
        });
        res.json(diagnoses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Profile Update
app.put('/api/auth/profile/:id', async (req, res) => {
    const { id } = req.params;
    const { fullName, email } = req.body;
    try {
        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { fullName, email }
        });
        res.json({ id: user.id, email: user.email, fullName: user.fullName, role: user.role, createdAt: user.createdAt });
    } catch (err) {
        res.status(400).json({ error: 'Update failed' });
    }
});

// Feedback
app.post('/api/feedback', async (req, res) => {
    const { userId, diagnosisId, rating, comment } = req.body;
    try {
        const feedback = await prisma.feedback.create({
            data: {
                userId: userId ? parseInt(userId) : null,
                diagnosisId: parseInt(diagnosisId),
                rating: parseInt(rating),
                comment
            }
        });
        res.json(feedback);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Data Export
app.get('/api/admin/export', authorize(['ADMIN']), async (req, res) => {
    try {
        const history = await prisma.diagnosis.findMany({
            include: { crop: true, disease: true, user: true }
        });
        res.json(history);
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
