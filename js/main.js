// main.js
document.addEventListener('DOMContentLoaded', function() {
    initLanguageSelector();
    if (document.getElementById('diagnosisForm')) initDiagnosisForm();
    if (document.getElementById('knowledgeBaseViewer')) initKnowledgeBaseViewer();
    if (document.getElementById('historyViewer')) initHistoryViewer();
});

function initLanguageSelector() {
    const languageSelect = document.getElementById('languageSelect');
    if (!languageSelect) return;

    languageSelect.addEventListener('change', function(e) {
        const lang = e.target.value;
        alert('Language support coming soon! For now, using English.');
    });
}

function initDiagnosisForm() {
    const form = document.getElementById('diagnosisForm');
    const cropSelect = document.getElementById('cropSelect');
    const symptomsContainer = document.getElementById('symptomsContainer');

    cropSelect.addEventListener('change', function(e) {
        const crop = e.target.value;
        if (crop) loadSymptomsForCrop(crop);
        else symptomsContainer.innerHTML = '<p>Please select a crop first</p>';
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        performDiagnosis();
    });
}

function loadSymptomsForCrop(crop) {
    const symptomsContainer = document.getElementById('symptomsContainer');
    const cropSymptoms = KnowledgeBase.getSymptomsForCrop(crop);

    if (!cropSymptoms.length) {
        symptomsContainer.innerHTML = '<p>No symptoms defined for this crop</p>';
        return;
    }

    let html = '<div class="symptom-options">';
    cropSymptoms.forEach(symptom => {
        html += `
            <div class="symptom-option">
                <input type="checkbox" id="${symptom.id}" name="symptoms" value="${symptom.id}">
                <label for="${symptom.id}">${symptom.description}</label>
            </div>`;
    });
    html += '</div>';

    html += `
        <div class="form-group">
            <label>Environmental Factors (optional):</label>
            <div class="symptom-options">
                <div class="symptom-option">
                    <input type="checkbox" id="high_humidity" value="high_humidity">
                    <label for="high_humidity">High humidity conditions</label>
                </div>
                <div class="symptom-option">
                    <input type="checkbox" id="recent_rain" value="recent_rain">
                    <label for="recent_rain">Recent rainfall</label>
                </div>
            </div>
        </div>`;
    
    symptomsContainer.innerHTML = html;
}

function performDiagnosis() {
    const crop = document.getElementById('cropSelect').value;
    if (!crop) return showAlert('Please select a crop type', 'error');

    const symptoms = Array.from(document.querySelectorAll('input[name="symptoms"]:checked')).map(cb => cb.value);
    if (!symptoms.length) return showAlert('Please select at least one symptom', 'error');

    const envFactors = {
        high_humidity: document.getElementById('high_humidity')?.checked || false,
        recent_rain: document.getElementById('recent_rain')?.checked || false
    };

    showLoading(true);

    setTimeout(() => {
        try {
            if (typeof InferenceEngine === 'undefined') {
                throw new Error('InferenceEngine not loaded. Check script order.');
            }
            if (typeof ExplanationFacility === 'undefined') {
                throw new Error('ExplanationFacility not loaded. Check script order.');
            }
            if (typeof KnowledgeBase === 'undefined') {
                throw new Error('KnowledgeBase not loaded. Check script order.');
            }

            const engine = new InferenceEngine(KnowledgeBase);
            const result = engine.diagnose(crop, symptoms, envFactors);

            const explainer = new ExplanationFacility();
            const explanation = explainer.generateExplanation(result, { crop, symptoms, environmental: envFactors });

            displayDiagnosisResults(result, explanation);
            saveToHistory(result, crop, symptoms);
        } catch (err) {
            console.error('Diagnosis error details:', err);
            showAlert('An error occurred during diagnosis: ' + err.message, 'error');
        } finally {
            showLoading(false);
        }
    }, 1500);
}

function displayDiagnosisResults(result, explanation) {
    const resultsContainer = document.getElementById('diagnosisResults');
    const form = document.getElementById('diagnosisForm');

    if (form) form.style.display = 'none';
    resultsContainer.style.display = 'block';

    let html = '<div class="diagnosis-card">';

    if (!result.diagnoses.length) {
        html += `
            <div class="alert alert-info">
                <h3>No Specific Disease Found</h3>
                <p>Based on the symptoms provided, no matching disease was identified.</p>
            </div>
            <div class="explanation-box">
                <h4>Possible Reasons:</h4>
                <ul>
                    <li>Nutrient deficiency in soil</li>
                    <li>Environmental stress (drought or excess water)</li>
                    <li>Pest damage without disease</li>
                    <li>Rare or new disease not in database</li>
                </ul>
                <p>Next Steps: Consult an agricultural expert or take photos of affected plants.</p>
            </div>`;
    } else {
        const diagnosis = result.diagnoses[0];

        html += `
            <h3 class="diagnosis-name">${diagnosis.disease}</h3>
            <div class="alert alert-success">
                <strong>Confidence Level:</strong> ${Math.round(diagnosis.confidence * 100)}%
            </div>
            <div class="treatment-section">
                <h4>Recommended Treatment:</h4>
                <ul>${diagnosis.treatment?.map(t => `<li>${t}</li>`).join('') || '<li>Consult an expert</li>'}</ul>
            </div>
            <div class="treatment-section">
                <h4>Prevention Measures:</h4>
                <ul>${diagnosis.prevention?.map(p => `<li>${p}</li>`).join('') || '<li>Practice good crop management</li>'}</ul>
            </div>
            <div class="explanation-section">
                <h4>How We Reached This Conclusion:</h4>
                <div class="explanation-box">
                    <p>${explanation.summary.ruleExplanation.replace(/\n/g, '<br>')}</p>
                </div>
            </div>
            <div class="educational-section">
                <h4>Learn More:</h4>
                <p>${explanation.educational.description || 'Maintain healthy crop practices and monitor for symptoms regularly.'}</p>
                <ul>
                    ${(explanation.educational.tips || []).map(t => `<li>${t}</li>`).join('')}
                </ul>
            </div>`;
    }

    html += `
        <div class="diagnosis-actions">
            <button onclick="resetDiagnosis()" class="btn btn-primary">Diagnose Another Crop</button>
            <button onclick="printResults()" class="btn btn-primary">Print Results</button>
            <button onclick="goToHome()" class="btn btn-primary"> Back to Home</button>
        </div>
    </div>`;

    resultsContainer.innerHTML = html;
}

function resetDiagnosis() {
    document.getElementById('diagnosisForm')?.reset();
    document.getElementById('diagnosisForm').style.display = 'block';
    const results = document.getElementById('diagnosisResults');
    results.style.display = 'none';
    results.innerHTML = '';
    document.getElementById('cropSelect').value = '';
    document.getElementById('symptomsContainer').innerHTML = '<p>Please select a crop to see symptoms</p>';
}

function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = show ? 'block' : 'none';
    }
}

function showAlert(msg, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = msg;
    
    const notificationArea = document.getElementById('notificationArea');
    if (notificationArea) {
        notificationArea.appendChild(alertDiv);
    } else {
        const header = document.querySelector('header');
        if (header) {
            header.insertAdjacentElement('afterend', alertDiv);
        } else {
            document.querySelector('.container').prepend(alertDiv);
        }
    }
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 3000);
    
    alertDiv.addEventListener('click', function() {
        this.remove();
    });
}

function saveToHistory(result, crop, symptoms) {
    const history = JSON.parse(localStorage.getItem('diagnosisHistory') || '[]');
    const record = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        crop,
        symptoms,
        diagnosis: result.diagnoses[0]?.disease || 'No diagnosis',
        confidence: result.diagnoses[0]?.confidence || 0
    };
    history.unshift(record);
    if (history.length > 20) history.pop();
    localStorage.setItem('diagnosisHistory', JSON.stringify(history));
}

function initKnowledgeBaseViewer() {
    const container = document.getElementById('knowledgeBaseViewer');
    if (!container) return;

    let html = '<div class="knowledge-base">';
    KnowledgeBase.crops.forEach(crop => {
        const rules = KnowledgeBase.getRulesForCrop(crop);
        html += `<div class="crop-section"><h3>${crop.charAt(0).toUpperCase() + crop.slice(1)}</h3><div class="rules-list">`;
        rules.forEach(rule => {
            html += `
                <div class="rule-card">
                    <div class="rule-header">
                        <strong>${rule.then.disease}</strong>
                        <span class="confidence">${Math.round(rule.then.confidence * 100)}% confidence</span>
                    </div>
                    <div class="rule-body">
                        <p><strong>IF:</strong> ${rule.condition.symptoms.join(' AND ')}</p>
                        <p><strong>THEN:</strong> ${rule.then.disease}</p>
                        <p><strong>Treatment:</strong></p>
                        <ul>${rule.then.treatment.map(t => `<li>${t}</li>`).join('')}</ul>
                    </div>
                </div>`;
        });
        html += '</div></div>';
    });
    html += '</div>';
    container.innerHTML = html;
}

function initHistoryViewer() {
    const container = document.getElementById('historyViewer');
    if (!container) return;

    const history = JSON.parse(localStorage.getItem('diagnosisHistory') || '[]');
    if (!history.length) {
        container.innerHTML = '<div class="alert alert-info">No diagnosis history yet. Start diagnosing crops!</div>';
        return;
    }

    let html = '<div class="history-list">';
    history.forEach(r => {
        html += `
            <div class="history-card">
                <div class="history-header">
                    <span class="history-date">${r.date}</span>
                    <span class="history-crop">${r.crop}</span>
                </div>
                <div class="history-body">
                    <p><strong>Diagnosis:</strong> ${r.diagnosis}</p>
                    <p><strong>Confidence:</strong> ${Math.round(r.confidence * 100)}%</p>
                    <p><strong>Symptoms:</strong> ${r.symptoms.join(', ')}</p>
                </div>
            </div>`;
    });
    html += `<div style="margin-top:2rem;"><button onclick="clearHistory()" class="btn btn-primary">Clear History</button></div>`;
    html += '</div>';
    container.innerHTML = html;
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all diagnosis history?')) {
        localStorage.removeItem('diagnosisHistory');
        initHistoryViewer();
        showAlert('History cleared successfully', 'success');
    }
}

function printResults() {
    const results = document.getElementById('diagnosisResults').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Crop Diagnosis Report</title>
                <link rel="stylesheet" href="../css/style.css">
            </head>
            <body>
                <div class="container">
                    <h1>Crop Disease Diagnosis Report</h1>
                    <p>Date: ${new Date().toLocaleString()}</p>
                    ${results}
                </div>
            </body>
        </html>`);
    printWindow.document.close();
    printWindow.print();
}
function goToHome() {
    window.location.href = '../index.html';
}